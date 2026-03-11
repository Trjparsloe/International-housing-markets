document.addEventListener('DOMContentLoaded', () => {
    
    // --- PART 1: LEFT SIDEBAR INTERSECTION OBSERVER ---
    const observerOptions = {
        root: null,
        // Widened the margin: Top 20% to Bottom 40% of the screen is the "Active Zone"
        rootMargin: '-10% 0px -60% 0px', 
        threshold: 0
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const id = entry.target.getAttribute('id');
                updateNav(id);
            }
        });
    }, observerOptions);

    function updateNav(id) {
        document.querySelectorAll('.nav-link').forEach(link => {
            const href = link.getAttribute('href').substring(1);
            if (href === id) {
                link.classList.add('active');
            } else {
                link.classList.remove('active');
            }
        });
    }

    // Observe sections
    const sections = document.querySelectorAll('#intro, h3[id]');
    sections.forEach(section => observer.observe(section));

    // --- PART 2: CLICK OVERRIDE ---
    // This ensures that when you click, the "Active" state updates immediately
    document.querySelectorAll('.nav-link').forEach(link => {
        link.addEventListener('click', (e) => {
            document.querySelectorAll('.nav-link').forEach(l => l.classList.remove('active'));
            link.classList.add('active');
        });
    });

    // --- PART 3: RIGHT SIDE PROGRESS SCROLL ---
    const progressBar = document.getElementById("verticalBar");

    window.addEventListener('scroll', () => {
        const winScroll = document.body.scrollTop || document.documentElement.scrollTop;
        const height = document.documentElement.scrollHeight - document.documentElement.clientHeight;
        const scrolled = (winScroll / height) * 100;
        
        if (progressBar) {
            progressBar.style.height = scrolled + "%";
        }
    });
});