(function () {
    'use strict';

    const navbar    = document.getElementById('navbar');
    const hamburger = document.getElementById('nav-hamburger');
    const navLinks  = document.getElementById('nav-links');
    const overlay   = document.getElementById('nav-overlay');

    /* ── 1. Scroll → solid navbar ── */
    function updateNavbar() {
        navbar.classList.toggle('scrolled', window.scrollY > 1);
    }

    window.addEventListener('scroll', updateNavbar, { passive: true });
    updateNavbar(); // run once on load

    /* ── 2. Hamburger toggle ── */
    function openDrawer() {
        hamburger.classList.add('open');
        navLinks.classList.add('open');
        overlay.classList.add('visible');
        hamburger.setAttribute('aria-expanded', 'true');
    }

    function closeDrawer() {
        hamburger.classList.remove('open');
        navLinks.classList.remove('open');
        overlay.classList.remove('visible');
        hamburger.setAttribute('aria-expanded', 'false');
        document.body.style.overflow = '';
        // Also close any open mobile accordions
        document.querySelectorAll('.has-dropdown.open').forEach(closeAccordion);
    }

    hamburger.addEventListener('click', () => {
        const isOpen = navLinks.classList.contains('open');
        isOpen ? closeDrawer() : openDrawer();
    });

    overlay.addEventListener('click', closeDrawer);

    /* ── 3. Mobile accordion dropdowns ── */
    function openAccordion(li) {
        li.classList.add('open');
        li.querySelector('button').setAttribute('aria-expanded', 'true');
        li.querySelector('.dropdown-menu').classList.add('open');
    }

    function closeAccordion(li) {
        li.classList.remove('open');
        li.querySelector('button').setAttribute('aria-expanded', 'false');
        li.querySelector('.dropdown-menu').classList.remove('open');
    }

    document.querySelectorAll('.has-dropdown button').forEach(btn => {
        btn.addEventListener('click', () => {
            const isMobile = window.innerWidth <= 768;
            if (!isMobile) return; // desktop uses CSS :hover

            const li = btn.closest('.has-dropdown');
            const isOpen = li.classList.contains('open');

            // Close siblings
            document.querySelectorAll('.has-dropdown.open').forEach(other => {
                if (other !== li) closeAccordion(other);
            });

            isOpen ? closeAccordion(li) : openAccordion(li);
        });
    });

    /* ── 4. Close on Escape key ── */
    document.addEventListener('keydown', e => {
        if (e.key === 'Escape') {
            closeDrawer();
            hamburger.focus();
        }
    });

    /* ── 5. Close drawer when a plain link is clicked (mobile) ── */
    navLinks.querySelectorAll('a:not(.nav-cta)').forEach(link => {
        link.addEventListener('click', () => {
            if (window.innerWidth <= 768) closeDrawer();
        });
    });

    /* ── 6. Reset on resize to desktop ── */
    let resizeTimer;
    window.addEventListener('resize', () => {
        clearTimeout(resizeTimer);
        resizeTimer = setTimeout(() => {
            if (window.innerWidth > 768) closeDrawer();
        }, 100);
    });

})();