document.querySelectorAll('.program-nav a').forEach(link => {
    link.addEventListener('click', e => {
        e.preventDefault();
        const target = link.dataset.tab;

        document.querySelectorAll('.program-nav a').forEach(l => l.classList.remove('active'));
        link.classList.add('active');

        document.querySelectorAll('.tab-panel').forEach(p => p.classList.remove('active'));
        document.querySelector(`.tab-panel[data-panel="${target}"]`).classList.add('active');
    });
});