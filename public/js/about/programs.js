(function () {
    'use strict';

    const navLinks = document.querySelectorAll('.program-nav a');
    const panels   = document.querySelectorAll('.tab-panel');

    function getNavHeight() {
        return document.querySelector('nav')?.offsetHeight || 0;
    }

    function scrollToSection(element) {
        const top = element.getBoundingClientRect().top + window.scrollY - getNavHeight();
        window.scrollTo({ top, behavior: 'smooth' });
    }

    function activateTab(tabName) {
        if (!tabName) return;
        const targetTab   = document.querySelector(`.program-nav a[data-tab="${tabName}"]`);
        const targetPanel = document.querySelector(`.tab-panel[data-panel="${tabName}"]`);
        if (!targetTab || !targetPanel) return;

        navLinks.forEach(l => l.classList.remove('active'));
        panels.forEach(p => p.classList.remove('active'));

        targetTab.classList.add('active');
        targetPanel.classList.add('active');
    }

    navLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            activateTab(link.getAttribute('data-tab'));
        });
    });

    document.addEventListener('DOMContentLoaded', () => {
        const hash = window.location.hash?.replace('#', '');

        if (hash === 'programs') {
            setTimeout(() => {
                const section = document.getElementById('programs');
                if (section) scrollToSection(section);
            }, 500);

        } else if (hash) {
            activateTab(hash);
            setTimeout(() => {
                const section = document.getElementById('programs');
                if (section) scrollToSection(section);
            }, 150);
        }
    });

    window.addEventListener('hashchange', () => {
        const hash = window.location.hash?.replace('#', '');
        if (hash === 'programs') {
            const section = document.getElementById('programs');
            if (section) scrollToSection(section);
        } else {
            activateTab(hash);
        }
    });

})();