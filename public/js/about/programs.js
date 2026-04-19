(function () {
    'use strict';

    const navLinks = document.querySelectorAll('.program-nav a');
    const panels   = document.querySelectorAll('.tab-panel');

    navLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const tab = link.getAttribute('data-tab');

            navLinks.forEach(l => l.classList.remove('active'));
            panels.forEach(p => p.classList.remove('active'));

            link.classList.add('active');
            document.querySelector(`.tab-panel[data-panel="${tab}"]`)?.classList.add('active');
        });
    });

    const hash = window.location.hash;
    if (hash) {
        const target = document.querySelector(hash);
        if (target) {
            const panel = target.dataset.panel;
            const matchingLink = document.querySelector(`.program-nav a[data-tab="${panel}"]`);

            navLinks.forEach(l => l.classList.remove('active'));
            panels.forEach(p => p.classList.remove('active'));

            target.classList.add('active');
            if (matchingLink) matchingLink.classList.add('active');

            target.scrollIntoView({ behavior: 'smooth' });
        }
    }
})();