document.addEventListener('DOMContentLoaded', () => {
    
// --- PART 0: RIDING TAB & CLICK-AWAY ---
    const sideNavContainer = document.querySelector('.side-nav-container');
    const toggle = document.querySelector('.side-nav-toggle');
    const overlay = document.querySelector('.side-nav-overlay');
    const closeX = document.querySelector('.side-nav-close-x');

    const openMenu = () => {
        sideNavContainer.classList.add('active');
        toggle.classList.add('active'); 
        overlay.classList.add('active');
    };

    const closeMenu = () => {
        sideNavContainer.classList.remove('active');
        toggle.classList.remove('active'); 
        overlay.classList.remove('active');
    };

    // This is the new "Toggle" function
    const toggleMenu = () => {
        if (sideNavContainer.classList.contains('active')) {
            closeMenu();
        } else {
            openMenu();
        }
    };

    // Update the Event Listener from 'openMenu' to 'toggleMenu'
    if (toggle) toggle.addEventListener('click', toggleMenu);
    
    // Keep these as 'closeMenu' because they should only ever close it
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

    // --- PART 3: ADAPTIVE PROGRESS SCROLL ---
    // Layout (top bar <=1450px, right rail above) lives in styles.css;
    // this just reports how far down the page you are.
    const progressBar = document.getElementById("verticalBar");

    function updateProgress() {
        const winScroll = document.body.scrollTop || document.documentElement.scrollTop;
        const height = document.documentElement.scrollHeight - document.documentElement.clientHeight;
        const scrolled = height > 0 ? (winScroll / height) * 100 : 0;
        if (progressBar) progressBar.style.setProperty('--progress', scrolled + '%');
    }

    // Run immediately and on every scroll/resize
    window.addEventListener('scroll', updateProgress);
    window.addEventListener('resize', updateProgress);
    updateProgress(); 
});
