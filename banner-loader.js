/**
 * Loads the banner-template.html content and injects it into the page.
 */
function loadBanner(title, imagePath, targetElementId) {
    const target = document.getElementById(targetElementId);
    
    if (!target) {
        console.error(`Target element #${targetElementId} not found.`);
        return;
    }

    // 1. Fetch the reusable banner HTML content
    fetch('./banner-template.html')
        .then(response => {
            if (!response.ok) throw new Error('Banner template file not found');
            return response.text();
        })
        .then(html => {
            // 2. Insert the HTML template
            target.innerHTML = html;
            updateBannerContent(title, imagePath);
        })
        .catch(error => {
            console.warn('Using fallback banner due to fetch error:', error);
            
            // FALLBACK: Manually create the banner if the template file can't be reached
            target.innerHTML = `
                <div class="banner-container">
                    <img src="${imagePath}" alt="${title}" class="banner-image" id="banner-img">
                    <h1 class="banner-title" id="banner-title-text">${title.toUpperCase()}</h1>
                </div>
            `;
        });
}

/**
 * Helper function to update IDs once the template is injected
 */
function updateBannerContent(title, imagePath) {
    const bannerImg = document.getElementById('banner-img');
    const bannerTitleText = document.getElementById('banner-title-text');

    if (bannerImg) {
        bannerImg.src = imagePath;
        bannerImg.alt = `${title} banner image`;
    }
    
    if (bannerTitleText) {
        bannerTitleText.textContent = title.toUpperCase();
    }
}