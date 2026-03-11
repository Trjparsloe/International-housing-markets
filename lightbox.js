document.addEventListener('DOMContentLoaded', () => {
    // 1. Create the Lightbox Elements with Navigation Arrows
    const lightbox = document.createElement('div');
    lightbox.id = 'lightbox-overlay';
    lightbox.innerHTML = `
        <div class="lightbox-close">&times;</div>
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
    const closeBtn = lightbox.querySelector('.lightbox-close');
    const prevBtn = lightbox.querySelector('.lightbox-prev');
    const nextBtn = lightbox.querySelector('.lightbox-next');

    // 2. State management
    const galleryImages = Array.from(document.querySelectorAll('figure img'));
    let currentIndex = 0;

    // Function to update content based on index
    const updateLightbox = (index) => {
        const image = galleryImages[index];
        const parentFigure = image.closest('figure');
        const captionText = parentFigure.querySelector('figcaption') ? parentFigure.querySelector('figcaption').innerText : '';

        lightboxImg.src = image.src;
        lightboxCap.innerText = captionText;
        currentIndex = index;
    };

    galleryImages.forEach((image, index) => {
        image.style.cursor = 'zoom-in';
        image.addEventListener('click', () => {
            updateLightbox(index);
            lightbox.classList.add('active');
            document.body.style.overflow = 'hidden';
        });
    });

    // 3. Navigation Logic
    const showNext = (e) => {
        e.stopPropagation(); 
        let nextIndex = (currentIndex + 1) % galleryImages.length;
        updateLightbox(nextIndex);
    };

    const showPrev = (e) => {
        e.stopPropagation();
        let prevIndex = (currentIndex - 1 + galleryImages.length) % galleryImages.length;
        updateLightbox(prevIndex);
    };

    nextBtn.addEventListener('click', showNext);
    prevBtn.addEventListener('click', showPrev);

    // 4. Close Logic
    const closeLightbox = () => {
        lightbox.classList.remove('active');
        document.body.style.overflow = '';
    };

    closeBtn.addEventListener('click', closeLightbox);
    
    lightbox.addEventListener('click', (e) => {
        // Close if clicking the background or the content wrapper (not the image/arrows)
        if (e.target === lightbox || e.target.classList.contains('lightbox-content')) {
            closeLightbox();
        }
    });

    // Keyboard Shortcuts
    document.addEventListener('keydown', (e) => {
        if (!lightbox.classList.contains('active')) return;
        
        if (e.key === 'ArrowRight') showNext(e);
        if (e.key === 'ArrowLeft') showPrev(e);
        if (e.key === 'Escape') closeLightbox();
    });
});