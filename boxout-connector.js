/* Linked box-outs (Ireland "other horsemen").
   Inside each .boxout-group: an inline a.boxout-trigger and a <details> box.
   Draws a line from the end of the trigger phrase down the right gutter to the box.
   On narrow screens there's no gutter, so no line: the phrase just opens the box. */
(function () {
    function draw(group) {
        var svg = group.querySelector('.boxout-connector');
        var trig = group.querySelector('.boxout-trigger');
        var box = group.querySelector('details');
        var para = trig && trig.closest('p');
        if (!svg || !trig || !box || !para) return;

        var G = group.getBoundingClientRect();
        var P = para.getBoundingClientRect();
        var rects = trig.getClientRects();
        var last = rects[rects.length - 1];

        svg.setAttribute('width', G.width);
        svg.setAttribute('height', G.height);

        var x0 = last.right - G.left + 4;
        var y0 = last.bottom - G.top - 3;  // on the phrase's underline
        var yg = y0 + 8;                   // drop into the gap between lines so the line doesn't strike through text
        var colRight = P.right - G.left;
        var d;
        if (G.right - P.right >= 40) {
            var B = box.getBoundingClientRect();
            var gx = colRight + 22;
            var by = B.top - G.top + 28;
            d = 'M' + x0 + ',' + y0 + ' L' + x0 + ',' + yg + ' L' + gx + ',' + yg + ' L' + gx + ',' + by + ' L' + (B.right - G.left + 8) + ',' + by; // +8 meets the box's hard shadow
        } else {
            svg.innerHTML = '';
            group.classList.remove('has-line');
            return;
        }
        group.classList.add('has-line');
        svg.innerHTML = '<path d="' + d + '"/><circle cx="' + x0 + '" cy="' + y0 + '" r="4"/>';
    }

    function init() {
        var groups = document.querySelectorAll('.boxout-group');
        if (!groups.length) return;
        var drawAll = function () { groups.forEach(draw); };

        groups.forEach(function (group) {
            var box = group.querySelector('details');
            group.querySelectorAll('[data-boxout]').forEach(function (link) {
                link.addEventListener('click', function (e) {
                    e.preventDefault();
                    box.open = true;
                    drawAll();
                    box.scrollIntoView({ behavior: 'smooth', block: 'center' });
                });
            });
            box.addEventListener('toggle', drawAll);
        });

        window.addEventListener('resize', drawAll);
        if ('ResizeObserver' in window) {
            var ro = new ResizeObserver(drawAll);
            groups.forEach(function (g) { ro.observe(g); });
        }
        if (document.fonts && document.fonts.ready) document.fonts.ready.then(drawAll);
        drawAll();
    }

    if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
    else init();
})();
