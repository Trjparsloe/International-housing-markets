document.addEventListener('DOMContentLoaded', () => {
    // 1. Create the Lightbox Elements
    const lightbox = document.createElement('div');
    lightbox.id = 'lightbox-overlay';
    lightbox.innerHTML = `
        <div class="lightbox-close">&times;</div>
        <div class="lightbox-counter"></div>
        <div class="lightbox-nav lightbox-prev">&#10094;</div>
        <div class="lightbox-content">
            <img src="" alt="Full Screen View">
            <div class="lightbox-caption"></div>
        </div>
        <div class="lightbox-nav lightbox-next">&#10095;</div>
    `;
    document.body.appendChild(lightbox);

    const lightboxImg = lightbox.querySelector('img');
    const lightboxCap = lightbox.querySelector('.lightbox-caption');
    const lightboxCount = lightbox.querySelector('.lightbox-counter');
    const closeBtn = lightbox.querySelector('.lightbox-close');
    const prevBtn = lightbox.querySelector('.lightbox-prev');
    const nextBtn = lightbox.querySelector('.lightbox-next');
    const sideNav = document.querySelector('.side-nav-container');

    // 2. State management
    const galleryImages = Array.from(document.querySelectorAll('figure img'));
    let currentIndex = 0;

    // 2b. Zoom & pan inside the lightbox
    //     Desktop: click to zoom in/out, scroll wheel to zoom, drag to pan.
    //     Mobile: pinch to zoom, double-tap to zoom in/out, drag to pan.
    const MAX_SCALE = 5;
    const CLICK_SCALE = 2.5;
    let scale = 1, tx = 0, ty = 0;
    let dragging = false, dragMoved = false, dragStartX = 0, dragStartY = 0, startTx = 0, startTy = 0;
    let pinchStartDist = 0, pinchStartScale = 1, wasPinching = false, lastTap = 0;

    lightboxImg.style.transformOrigin = '0 0';
    lightboxImg.style.touchAction = 'none';
    lightboxImg.draggable = false;

    // Untransformed position/size of the image on screen
    const baseRect = () => {
        const r = lightboxImg.getBoundingClientRect();
        return { left: r.left - tx, top: r.top - ty, width: r.width / scale, height: r.height / scale };
    };

    const clampPan = (b) => {
        tx = Math.min(0, Math.max(b.width * (1 - scale), tx));
        ty = Math.min(0, Math.max(b.height * (1 - scale), ty));
    };

    const applyTransform = (animate) => {
        lightboxImg.style.transition = animate ? 'transform 0.25s ease' : 'none';
        lightboxImg.style.transform = `translate(${tx}px, ${ty}px) scale(${scale})`;
        lightboxImg.style.cursor = scale > 1 ? (dragging ? 'grabbing' : 'grab') : 'zoom-in';
        lightbox.classList.toggle('zoomed', scale > 1);
    };

    // Zoom to newScale while keeping the screen point (px, py) fixed
    const zoomAt = (newScale, px, py, animate) => {
        const b = baseRect();
        // Never enlarge beyond the photo's real pixels (avoids visible pixelation)
        const nativeMax = lightboxImg.naturalWidth ? lightboxImg.naturalWidth / b.width : MAX_SCALE;
        const maxScale = Math.max(1, Math.min(MAX_SCALE, nativeMax));
        newScale = Math.min(maxScale, Math.max(1, newScale));
        const x = (px - b.left - tx) / scale;
        const y = (py - b.top - ty) / scale;
        scale = newScale;
        tx = px - b.left - scale * x;
        ty = py - b.top - scale * y;
        clampPan(b);
        applyTransform(animate);
    };

    function resetZoom(animate) {
        scale = 1; tx = 0; ty = 0; dragging = false;
        applyTransform(animate);
    }

    // Mouse: click toggles zoom, wheel zooms, drag pans
    lightboxImg.addEventListener('mousedown', (e) => {
        if (e.button !== 0) return;
        e.preventDefault();
        dragMoved = false;
        dragStartX = e.clientX; dragStartY = e.clientY; startTx = tx; startTy = ty;
        if (scale > 1) { dragging = true; applyTransform(false); }
    });

    window.addEventListener('mousemove', (e) => {
        if (!dragging) return;
        const dx = e.clientX - dragStartX, dy = e.clientY - dragStartY;
        if (Math.abs(dx) + Math.abs(dy) > 4) dragMoved = true;
        const b = baseRect();
        tx = startTx + dx; ty = startTy + dy;
        clampPan(b);
        applyTransform(false);
    });

    window.addEventListener('mouseup', () => {
        if (dragging) { dragging = false; applyTransform(false); }
    });

    lightboxImg.addEventListener('click', (e) => {
        e.stopPropagation();
        if (dragMoved) { dragMoved = false; return; }
        if (scale > 1) resetZoom(true);
        else zoomAt(CLICK_SCALE, e.clientX, e.clientY, true);
    });

    lightboxImg.addEventListener('wheel', (e) => {
        e.preventDefault();
        const factor = e.deltaY < 0 ? 1.2 : 1 / 1.2;
        zoomAt(scale * factor, e.clientX, e.clientY, false);
    }, { passive: false });

    // Touch: pinch zooms, one finger pans when zoomed, double-tap toggles
    const touchDist = (t) => Math.hypot(t[0].clientX - t[1].clientX, t[0].clientY - t[1].clientY);
    const touchMid = (t) => ({ x: (t[0].clientX + t[1].clientX) / 2, y: (t[0].clientY + t[1].clientY) / 2 });

    lightboxImg.addEventListener('touchstart', (e) => {
        if (e.touches.length === 2) {
            wasPinching = true;
            pinchStartDist = touchDist(e.touches);
            pinchStartScale = scale;
        } else if (e.touches.length === 1) {
            const t = e.touches[0];
            dragStartX = t.clientX; dragStartY = t.clientY; startTx = tx; startTy = ty;
            const now = Date.now();
            if (now - lastTap < 300) {
                if (scale > 1) resetZoom(true);
                else zoomAt(CLICK_SCALE, t.clientX, t.clientY, true);
                lastTap = 0;
            } else {
                lastTap = now;
            }
        }
    }, { passive: true });

    lightboxImg.addEventListener('touchmove', (e) => {
        if (e.touches.length === 2) {
            e.preventDefault();
            const m = touchMid(e.touches);
            zoomAt(pinchStartScale * (touchDist(e.touches) / pinchStartDist), m.x, m.y, false);
        } else if (e.touches.length === 1 && scale > 1) {
            e.preventDefault();
            const t = e.touches[0];
            const b = baseRect();
            tx = startTx + (t.clientX - dragStartX);
            ty = startTy + (t.clientY - dragStartY);
            clampPan(b);
            applyTransform(false);
        }
    }, { passive: false });

    const updateLightbox = (index) => {
        const image = galleryImages[index];
        const parentFigure = image.closest('figure');
        const captionText = parentFigure.querySelector('figcaption') ? parentFigure.querySelector('figcaption').innerText : '';

        resetZoom(false);
        // Show the web-sized version straight away, then swap in the
        // full-resolution original (data-full) once it has loaded, for zooming.
        // The web copy (often 1000px) is smaller than the space available, so
        // without a fixed size the photo would visibly grow when the larger
        // file arrives. Size the box from the photo's shape up front instead.
        lightboxImg.style.width = '';
        lightboxImg.style.maxWidth = '';
        if (image.dataset.full && image.naturalWidth) {
            const ratio = image.naturalWidth / image.naturalHeight;
            lightboxImg.style.width = `min(100%, calc(75vh * ${ratio}))`;
        }
        lightboxImg.src = image.currentSrc || image.src;
        if (image.dataset.full) {
            const hi = new Image();
            hi.onload = () => {
                if (currentIndex !== index) return;
                // Never stretch past the large file's real pixels
                lightboxImg.style.maxWidth = `min(100%, ${hi.naturalWidth}px)`;
                lightboxImg.src = hi.src;
            };
            hi.src = image.dataset.full;
        }
        lightboxCap.innerText = captionText;
        currentIndex = index;

        // Update Counter (e.g., 1 / 12)
        lightboxCount.innerText = `${currentIndex + 1} / ${galleryImages.length}`;
    };

    galleryImages.forEach((image, index) => {
        image.style.cursor = 'zoom-in';
        image.addEventListener('click', () => {
            updateLightbox(index);
            lightbox.classList.add('active');
            document.body.style.overflow = 'hidden';
            // Hide side nav when lightbox opens
            if (sideNav) {
                sideNav.style.display = 'none';
            }
        });
    });

    // 3. Navigation Functions
    const showNext = (e) => {
        if(e) e.stopPropagation();
        let nextIndex = (currentIndex + 1) % galleryImages.length;
        updateLightbox(nextIndex);
    };

    const showPrev = (e) => {
        if(e) e.stopPropagation();
        let prevIndex = (currentIndex - 1 + galleryImages.length) % galleryImages.length;
        updateLightbox(prevIndex);
    };

    nextBtn.addEventListener('click', showNext);
    prevBtn.addEventListener('click', showPrev);

    // 4. Swipe Logic for Mobile
    let touchStartX = 0;
    let touchEndX = 0;

    lightbox.addEventListener('touchstart', (e) => {
        touchStartX = e.changedTouches[0].screenX;
    }, { passive: true });

    lightbox.addEventListener('touchend', (e) => {
        touchEndX = e.changedTouches[0].screenX;
        // Don't change photo while zoomed or straight after a pinch
        if (wasPinching) { if (e.touches.length === 0) wasPinching = false; return; }
        if (scale > 1) return;
        handleSwipe();
    }, { passive: true });

    const handleSwipe = () => {
        const threshold = 50; // Minimum distance to be considered a swipe
        if (touchEndX < touchStartX - threshold) showNext(); // Swiped Left
        if (touchEndX > touchStartX + threshold) showPrev(); // Swiped Right
    };

    // 5. Close Logic
    const closeLightbox = () => {
        resetZoom(false);
        lightbox.classList.remove('active');
        document.body.style.overflow = '';
        // Show side nav when lightbox closes
        if (sideNav) {
            sideNav.style.display = '';
        }
    };

    closeBtn.addEventListener('click', closeLightbox);
    lightbox.addEventListener('click', (e) => {
        if (e.target === lightbox || e.target.classList.contains('lightbox-content')) {
            closeLightbox();
        }
    });

    // Keyboard Support
    document.addEventListener('keydown', (e) => {
        if (!lightbox.classList.contains('active')) return;
        if (e.key === 'ArrowRight') showNext();
        if (e.key === 'ArrowLeft') showPrev();
        if (e.key === 'Escape') closeLightbox();
    });
});
