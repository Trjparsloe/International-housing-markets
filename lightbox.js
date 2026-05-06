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

    const updateLightbox = (index) => {
        const image = galleryImages[index];
        const parentFigure = image.closest('figure');
        const captionText = parentFigure.querySelector('figcaption') ? parentFigure.querySelector('figcaption').innerText : '';

        lightboxImg.src = image.src;
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
        handleSwipe();
    }, { passive: true });

    const handleSwipe = () => {
        const threshold = 50; // Minimum distance to be considered a swipe
        if (touchEndX < touchStartX - threshold) showNext(); // Swiped Left
        if (touchEndX > touchStartX + threshold) showPrev(); // Swiped Right
    };

    // 5. Close Logic
    const closeLightbox = () => {
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
