/**
 * Lightbox Logic for International Housing Markets
 * Handles full-screen image expansion with scroll locking.
 */

document.addEventListener('DOMContentLoaded', () => {
    // 1. Create the Lightbox Elements
    const lightbox = document.createElement('div');
    lightbox.id = 'lightbox-overlay';
    lightbox.innerHTML = `
        <div class="lightbox-close">&times;</div>
        <div class="lightbox-content">
            <img src="" alt="Full Screen View">
            <div class="lightbox-caption"></div>
        </div>
    `;
    document.body.appendChild(lightbox);

    const lightboxImg = lightbox.querySelector('img');
    const lightboxCap = lightbox.querySelector('.lightbox-caption');
    const closeBtn = lightbox.querySelector('.lightbox-close');

    // 2. Find all images within figures (Grids, Heros, and Appendix)
    const galleryImages = document.querySelectorAll('figure img');

    galleryImages.forEach(image => {
        // Add a pointer cursor to show they are clickable
        image.style.cursor = 'zoom-in';

        image.addEventListener('click', () => {
            const parentFigure = image.closest('figure');
            const captionText = parentFigure.querySelector('figcaption') ? parentFigure.querySelector('figcaption').innerText : '';

            // Set content
            lightboxImg.src = image.src;
            lightboxCap.innerText = captionText;

            // Show Lightbox and Lock Scroll
            lightbox.classList.add('active');
            document.body.style.overflow = 'hidden';
        });
    });

    // 3. Close Logic
    const closeLightbox = () => {
        lightbox.classList.remove('active');
        document.body.style.overflow = ''; // Restore Scroll
    };

    closeBtn.addEventListener('click', closeLightbox);
    
    // Close on clicking the background (not the image)
    lightbox.addEventListener('click', (e) => {
        if (e.target === lightbox || e.target.classList.contains('lightbox-content')) {
            closeLightbox();
        }
    });

    // Close on Escape key
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && lightbox.classList.contains('active')) {
            closeLightbox();
        }
    });
});