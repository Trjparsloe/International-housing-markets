/**
 * Loads the banner-template.html content and injects it into the page.
 * @param {string} title - The main text for the banner (e.g., "JAPAN").
 * @param {string} imagePath - The path to the specific image for this page.
 * @param {string} targetElementId - The ID of the element where the banner should be placed.
 */
function loadBanner(title, imagePath, targetElementId) {
    // 1. Fetch the reusable banner HTML content
    fetch('./banner-template.html')
        .then(response => response.text())
        .then(html => {
            const target = document.getElementById(targetElementId);
            if (target) {
                // 2. Insert the HTML template into the target element
                target.innerHTML = html;

                // 3. Update the dynamic content (Image and Title)
                const bannerImg = document.getElementById('banner-img');
                const bannerTitleText = document.getElementById('banner-title-text');

                if (bannerImg) {
                    bannerImg.src = imagePath;
                }
                if (bannerTitleText) {
                    bannerTitleText.textContent = title;
                }
            } else {
                console.error(`Target element #${targetElementId} not found.`);
            }
        })
        .catch(error => console.error('Error loading banner template:', error));
}