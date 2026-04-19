(function () {
    'use strict';

    const section = document.getElementById('impact');
    if (!section) return;

    const cards   = Array.from(section.querySelectorAll('.impact-card'));
    const numbers = Array.from(section.querySelectorAll('.impact-number'));

    if (!cards.length) return;

    function easeOutQuart(t) {
        return 1 - Math.pow(1 - t, 4);
    }

    function animateNumber(el) {
        const target   = parseInt(el.getAttribute('data-target'), 10);
        const duration = target >= 1000 ? 2000 : 1400;
        let startTime  = null;

        function step(timestamp) {
            if (!startTime) startTime = timestamp;
            const elapsed  = timestamp - startTime;
            const progress = Math.min(elapsed / duration, 1);
            const eased    = easeOutQuart(progress);
            el.textContent = Math.floor(eased * target).toLocaleString();
            if (progress < 1) requestAnimationFrame(step);
            else el.textContent = target.toLocaleString();
        }

        requestAnimationFrame(step);
    }

    let hasAnimated = false;

    const observer = new IntersectionObserver(
        (entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting && !hasAnimated) {
                    hasAnimated = true;
                    cards.forEach(card => card.classList.add('visible'));
                    numbers.forEach(el => animateNumber(el));
                    observer.disconnect();
                }
            });
        },
        { threshold: 0.3 }
    );

    observer.observe(section);

})();