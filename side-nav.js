document.addEventListener('DOMContentLoaded', () => {
    
    // --- PART 1: LEFT SIDEBAR INTERSECTION OBSERVER ---
    const observerOptions = {
        root: null,
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

    const sections = document.querySelectorAll('#intro, h3[id]');
    sections.forEach(section => observer.observe(section));

    // --- PART 2: CLICK OVERRIDE & AUTO-HIDE ---
    document.querySelectorAll('.nav-link').forEach(link => {
        link.addEventListener('click', (e) => {
            document.querySelectorAll('.nav-link').forEach(l => l.classList.remove('active'));
            link.classList.add('active');

            // Force Sidebar to slide back on laptop after clicking
            if (window.innerWidth <= 1450) {
                const container = document.querySelector('.side-nav-container');
                
                // We briefly set a very small negative margin to 'nudge' it shut
                // but then we clear the inline style so the CSS hover takes back control
                container.style.transform = 'translateX(-270px)';
                
                setTimeout(() => { 
                    container.style.transform = ''; 
                }, 500);
            }
        });
    });

    // --- PART 3: ADAPTIVE PROGRESS SCROLL (STABILIZED) ---
    const progressBar = document.getElementById("verticalBar");
    const railContainer = document.querySelector(".right-progress-rail");

    function updateProgress() {
        const winScroll = document.body.scrollTop || document.documentElement.scrollTop;
        const height = document.documentElement.scrollHeight - document.documentElement.clientHeight;
        const scrolled = (winScroll / height) * 100;
        
        if (progressBar && railContainer) {
            if (window.innerWidth <= 1450) {
                // Horizontal Top Bar (Laptop)
                railContainer.style.width = "100%";
                railContainer.style.height = "4px";
                railContainer.style.top = "0";
                railContainer.style.left = "0";
                railContainer.style.right = "auto";
                railContainer.style.background = "rgba(0, 0, 0, 0.05)";
                
                progressBar.style.width = scrolled + "%";
                progressBar.style.height = "100%";
            } else {
                // Vertical Right Rail (Desktop)
                railContainer.style.width = "2px";
                railContainer.style.height = "60%";
                railContainer.style.top = "20%";
                railContainer.style.right = "40px";
                railContainer.style.left = "auto";
                railContainer.style.background = "rgba(0, 0, 0, 0.05)";
                
                progressBar.style.height = scrolled + "%";
                progressBar.style.width = "100%";
            }
        }
    }

    // Run immediately and on every scroll/resize
    window.addEventListener('scroll', updateProgress);
    window.addEventListener('resize', updateProgress);
    updateProgress(); 
});