document.addEventListener('DOMContentLoaded', () => {
    
// --- PART 0: RIDING TAB & CLICK-AWAY ---
    const sideNavContainer = document.querySelector('.side-nav-container');
    const toggle = document.querySelector('.side-nav-toggle');
    const overlay = document.querySelector('.side-nav-overlay');
    const closeX = document.querySelector('.side-nav-close-x');

    const openMenu = () => {
        sideNavContainer.classList.add('active');
        toggle.classList.add('active'); // Moves the tab to the right
        overlay.classList.add('active');
    };

    const closeMenu = () => {
        sideNavContainer.classList.remove('active');
        toggle.classList.remove('active'); // Moves the tab back to the left
        overlay.classList.remove('active');
    };

    if (toggle) toggle.addEventListener('click', openMenu);
    if (overlay) overlay.addEventListener('click', closeMenu);
    if (closeX) closeX.addEventListener('click', closeMenu);
    
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

// --- PART 2: CLICK OVERRIDE (Highlight only) ---
    document.querySelectorAll('.nav-link').forEach(link => {
        link.addEventListener('click', () => {
            document.querySelectorAll('.nav-link').forEach(l => l.classList.remove('active'));
            link.classList.add('active');
            
            // Sidebar remains open for manual closure via X or clicking outside
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
