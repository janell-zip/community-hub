(function () {
    'use strict';

    const section = document.getElementById('what-we-do');
    if (!section) return;

    const slider   = section.querySelector('.wwd-slider');
    const btnPrev  = section.querySelector('.wwd-btn-prev');
    const btnNext  = section.querySelector('.wwd-btn-next');
    const dotsWrap = section.querySelector('.wwd-dots');
    const cards    = Array.from(slider.querySelectorAll('.wwd-card'));

    if (!cards.length) return;

    const dotCount = 3;
    const step = Math.ceil(cards.length / dotCount);

    for (let i = 0; i < dotCount; i++) {
        const dot = document.createElement('button');
        dot.className = 'wwd-dot' + (i === 0 ? ' active' : '');
        dot.setAttribute('aria-label', `Go to page ${i + 1}`);
        dot.addEventListener('click', () => scrollToCard(i * step));
        dotsWrap.appendChild(dot);
    }

    const dots = Array.from(dotsWrap.querySelectorAll('.wwd-dot'));

    function scrollToCard(index) {
        const card = cards[index];
        if (!card) return;

        const start = slider.scrollLeft;
        const target = card.offsetLeft - slider.offsetLeft;
        const distance = target - start;
        const duration = 500;
        let startTime = null;

        function easeInOutCubic(t) {
            return t < 0.5
                ? 4 * t * t * t
                : 1 - Math.pow(-2 * t + 2, 3) / 2;
        }

        function step(timestamp) {
            if (!startTime) startTime = timestamp;
            const elapsed = timestamp - startTime;
            const progress = Math.min(elapsed / duration, 1);
            slider.scrollLeft = start + distance * easeInOutCubic(progress);
            if (progress < 1) requestAnimationFrame(step);
            else syncUI();
        }

        requestAnimationFrame(step);
    }

    function getActiveIndex() {
        const sliderLeft = slider.getBoundingClientRect().left;
        let closest = 0;
        let minDist  = Infinity;

        cards.forEach((card, i) => {
            const dist = Math.abs(card.getBoundingClientRect().left - sliderLeft);
            if (dist < minDist) {
                minDist  = dist;
                closest  = i;
            }
        });

        return closest;
    }

    function updateArrows(index) {
        const atStart = index === 0;
        const atEnd   = index === cards.length - 1;

        btnPrev.disabled = atStart;
        btnNext.disabled = atEnd;

        btnPrev.setAttribute('aria-disabled', atStart);
        btnNext.setAttribute('aria-disabled', atEnd);

        btnPrev.classList.toggle('inactive', atStart);
        btnNext.classList.toggle('inactive', atEnd);
    }

    function syncUI() {
        const active = getActiveIndex();
        dots.forEach((dot, i) => dot.classList.toggle('active', i === active));
        updateArrows(active);
    }

    btnPrev.addEventListener('click', () => {
        if (btnPrev.disabled) return;
        scrollToCard(getActiveIndex() - 1);
    });

    btnNext.addEventListener('click', () => {
        if (btnNext.disabled) return;
        scrollToCard(getActiveIndex() + 1);
    });

    let scrollTimer;
    slider.addEventListener('scroll', () => {
        clearTimeout(scrollTimer);
        scrollTimer = setTimeout(syncUI, 80);
    }, { passive: true });

    slider.setAttribute('tabindex', '0');
    slider.addEventListener('keydown', (e) => {
        if (e.key === 'ArrowRight') { e.preventDefault(); btnNext.click(); }
        if (e.key === 'ArrowLeft')  { e.preventDefault(); btnPrev.click(); }
    });

    syncUI();

})();