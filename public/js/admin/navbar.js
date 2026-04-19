(function () {
    'use strict';

    const links = document.querySelectorAll('.admin-nav-links a');
    const path  = window.location.pathname;
    // Avatar dropdown
    const avatarWrap     = document.getElementById('nav-avatar-wrap');
    const userDropdown   = document.getElementById('nav-user-dropdown');

    if (avatarWrap && userDropdown) {
        avatarWrap.addEventListener('click', function (e) {
            e.stopPropagation();
            userDropdown.hidden = !userDropdown.hidden;
        });

        document.addEventListener('click', function () {
            userDropdown.hidden = true;
        });
    }

    links.forEach(link => {
        if (link.getAttribute('href') === path) {
            link.classList.add('active');
        }
    });

    // Export button placeholder
    // Will update soon
    const exportBtn = document.getElementById('admin-export-btn');
    if (exportBtn) {
        exportBtn.addEventListener('click', () => {
            // Export logic will go here
            // Will update soon
            console.log('Export triggered');
        });
    }

})();