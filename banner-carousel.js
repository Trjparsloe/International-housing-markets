/* ======================================================================
   3. SHUFFLED SEQUENTIAL CAROUSEL LOGIC
   ====================================================================== */
document.addEventListener('DOMContentLoaded', () => {
    const track = document.querySelector('.carousel__track');
    if (!track) return;

    let slides = Array.from(track.children);
    const intervalTime = 4000;
    let currentSlideIndex = 0;

    const shuffleSlides = (array) => {
        for (let i = array.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [array[i], array[j]] = [array[j], array[i]];
        }
        return array;
    };

    slides = shuffleSlides(slides);
    slides.forEach(slide => {
        slide.classList.remove('current-slide');
        track.appendChild(slide);
    });

    if(slides.length > 0) slides[0].classList.add('current-slide');

    const moveToNextSlide = () => {
        const currentSlide = slides[currentSlideIndex];
        currentSlideIndex = (currentSlideIndex + 1) % slides.length;
        const nextSlide = slides[currentSlideIndex];

        currentSlide.classList.remove('current-slide');
        nextSlide.classList.add('current-slide');
    };

    setInterval(moveToNextSlide, intervalTime);
});