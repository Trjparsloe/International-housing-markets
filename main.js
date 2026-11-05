    // Snappy JavaScript Hover/Interaction Handler for Sidebar Illustrations
    document.addEventListener("DOMContentLoaded", function() {
        const structuralGroups = document.querySelectorAll('.typology-group');
        const mainSvgContainer = document.getElementById('interactive-blueprint');

        structuralGroups.forEach(group => {
            group.addEventListener('mouseenter', function() {
                mainSvgContainer.style.opacity = "0.9";
                this.classList.add('js-hovered');
                this.style.transform = "translateY(-4px)";
            });

            group.addEventListener('mouseleave', function() {
                mainSvgContainer.style.opacity = "0.55";
                this.classList.remove('js-hovered');
                this.style.transform = "translateY(0px)";
            });
        });
    });