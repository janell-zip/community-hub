(function () {
    'use strict';

    const searchInput = document.getElementById('barangay-search');

    let searchDebounce = null;

    searchInput.addEventListener('input', () => {
        clearTimeout(searchDebounce);
        searchDebounce = setTimeout(() => {
            const query   = searchInput.value.trim();
            const baseUrl = searchInput.dataset.url;
            const params  = new URLSearchParams(window.location.search);

            if (query) {
                params.set('search', query);
            } else {
                params.delete('search');
            }
            params.delete('page');

            const url = `${baseUrl}?${params.toString()}`;

            fetch(url, { headers: { 'X-Requested-With': 'XMLHttpRequest' } })
                .then(res => res.text())
                .then(html => {
                    const parser   = new DOMParser();
                    const doc      = parser.parseFromString(html, 'text/html');
                    const newTable = doc.querySelector('.community-table-wrap');
                    const newPager = doc.querySelector('.community-pagination');

                    if (newTable) document.querySelector('.community-table-wrap').innerHTML = newTable.innerHTML;

                    if (newPager && document.querySelector('.community-pagination')) {
                        document.querySelector('.community-pagination').innerHTML = newPager.innerHTML;
                    } else if (newPager) {
                        document.querySelector('.community-page').appendChild(newPager);
                    }

                    window.history.replaceState({}, '', url);
                });
        }, 400);
    });

    document.addEventListener('click', function (e) {
        const link = e.target.closest('.community-pagination a');
        if (!link) return;

        const href = link.getAttribute('href');
        if (!href) return;

        e.preventDefault();

        fetch(href, { headers: { 'X-Requested-With': 'XMLHttpRequest' } })
            .then(res => res.text())
            .then(html => {
                const parser   = new DOMParser();
                const doc      = parser.parseFromString(html, 'text/html');
                const newTable = doc.querySelector('.community-table-wrap');
                const newPager = doc.querySelector('.community-pagination');
                const newStats = doc.querySelector('.community-stats');

                if (newTable) document.querySelector('.community-table-wrap').innerHTML = newTable.innerHTML;
                if (newPager) document.querySelector('.community-pagination').innerHTML = newPager.innerHTML;
                if (newStats) document.querySelector('.community-stats').innerHTML = newStats.innerHTML;

                window.history.pushState({}, '', href);

                document.querySelector('.community-table-wrap').scrollIntoView({ behavior: 'smooth', block: 'start' });
            });
    });

    // ── Delete Modal ─────────────────────────────────────────────
    const deleteOverlay  = document.getElementById('delete-modal');
    const deleteConfirm  = document.getElementById('cbdeletemodal-confirm');
    const deleteBtnText  = deleteConfirm.querySelector('.cbmodal-btn-text');
    const deleteBtnSpinner = deleteConfirm.querySelector('.cbmodal-btn-spinner');
    let deleteTarget = null;

    function openDeleteModal(barangay) {
        deleteTarget = barangay;
        document.getElementById('delete-barangay-name').textContent = barangay.name;
        deleteOverlay.setAttribute('aria-hidden', 'false');
        deleteOverlay.classList.add('is-open');
        document.body.style.overflow = 'hidden';
    }

    function closeDeleteModal() {
        deleteOverlay.classList.remove('is-open');
        deleteOverlay.setAttribute('aria-hidden', 'true');
        document.body.style.overflow = '';
        deleteTarget = null;
    }

    function setDeleteLoading(loading) {
        deleteConfirm.disabled    = loading;
        deleteBtnText.hidden      = loading;
        deleteBtnSpinner.hidden   = !loading;
    }

    document.addEventListener('click', function (e) {
        const deleteBtn = e.target.closest('.action-btn--delete');
        if (!deleteBtn) return;
        e.preventDefault();

        openDeleteModal({
            id:   deleteBtn.dataset.id,
            name: deleteBtn.dataset.name,
        });
    });

    document.getElementById('cbdeletemodal-close').addEventListener('click', closeDeleteModal);
    document.getElementById('cbdeletemodal-cancel').addEventListener('click', closeDeleteModal);

    deleteOverlay.addEventListener('click', function (e) {
        if (e.target === deleteOverlay) closeDeleteModal();
    });

    document.addEventListener('keydown', function (e) {
        if (e.key === 'Escape' && deleteOverlay.classList.contains('is-open')) closeDeleteModal();
    });

    deleteConfirm.addEventListener('click', async function () {
        if (!deleteTarget) return;
        setDeleteLoading(true);

        try {
            const res  = await fetch(`/admin/community/${deleteTarget.id}`, {
                method: 'POST',
                headers: {
                    'X-Requested-With': 'XMLHttpRequest',
                    'Accept':           'application/json',
                    'X-CSRF-TOKEN':     document.querySelector('meta[name="csrf-token"]').content,
                },
                body: (() => {
                    const f = new FormData();
                    f.append('_method', 'DELETE');
                    return f;
                })(),
            });

            const data = await res.json();
            if (!res.ok) throw new Error(data.message || 'Something went wrong.');

            // Remove the row from the table
            const row = document.querySelector(`.action-btn--delete[data-id="${deleteTarget.id}"]`)?.closest('tr');
            if (row) row.remove();

            const deletedName = deleteTarget.name;
            closeDeleteModal();
            showToast(`"${deletedName}" deleted successfully.`, 'success');

            // Refresh stats and pagination
            fetch(window.location.href, { headers: { 'X-Requested-With': 'XMLHttpRequest' } })
                .then(r => r.text())
                .then(html => {
                    const parser   = new DOMParser();
                    const doc      = parser.parseFromString(html, 'text/html');
                    const newStats = doc.querySelector('.community-stats');
                    const newPager = doc.querySelector('.community-pagination');

                    if (newStats) document.querySelector('.community-stats').innerHTML = newStats.innerHTML;
                    if (newPager && document.querySelector('.community-pagination')) {
                        document.querySelector('.community-pagination').innerHTML = newPager.innerHTML;
                    }
                });

        } catch (err) {
            showToast(err.message, 'error');
        } finally {
            setDeleteLoading(false);
        }
    });
    
    // ── Create Modal ─────────────────────────────────────────────
    const createOverlay  = document.getElementById('create-modal');
    const createForm     = document.getElementById('create-barangay-form');
    const createErrorBox = document.getElementById('cbcreatemodal-error');
    const createSaveBtn  = document.getElementById('cbcreatemodal-save');
    const createBtnText  = createSaveBtn.querySelector('.cbmodal-btn-text');
    const createBtnSpinner = createSaveBtn.querySelector('.cbmodal-btn-spinner');

    function openCreateModal() {
        createForm.reset();
        document.getElementById('create-city').value     = 'Tuguegarao City';
        document.getElementById('create-province').value = 'Cagayan';
        createErrorBox.hidden = true;
        createErrorBox.textContent = '';
        createOverlay.setAttribute('aria-hidden', 'false');
        createOverlay.classList.add('is-open');
        document.getElementById('create-name').focus();
        document.body.style.overflow = 'hidden';
    }

    function closeCreateModal() {
        createOverlay.classList.remove('is-open');
        createOverlay.setAttribute('aria-hidden', 'true');
        document.body.style.overflow = '';
    }

    function setCreateLoading(loading) {
        createSaveBtn.disabled   = loading;
        createBtnText.hidden     = loading;
        createBtnSpinner.hidden  = !loading;
    }

    document.getElementById('open-create-modal').addEventListener('click', openCreateModal);
    document.getElementById('cbcreatemodal-close').addEventListener('click', closeCreateModal);
    document.getElementById('cbcreatemodal-cancel').addEventListener('click', closeCreateModal);

    createOverlay.addEventListener('click', function (e) {
        if (e.target === createOverlay) closeCreateModal();
    });

    document.addEventListener('keydown', function (e) {
        if (e.key === 'Escape' && createOverlay.classList.contains('is-open')) closeCreateModal();
    });

    createForm.addEventListener('submit', async function (e) {
        e.preventDefault();
        setCreateLoading(true);
        createErrorBox.hidden = true;
        document.querySelectorAll('#create-barangay-form .cbfield-input')
            .forEach(i => i.classList.remove('is-invalid'));

        const coordsRaw = document.getElementById('create-coordinates').value.trim();
        if (coordsRaw) {
            try { JSON.parse(coordsRaw); }
            catch {
                document.getElementById('create-coordinates').classList.add('is-invalid');
                createErrorBox.textContent = 'Coordinates must be valid JSON.';
                createErrorBox.hidden = false;
                setCreateLoading(false);
                return;
            }
        }

        const body = new FormData(createForm);

        try {
            const res  = await fetch(createForm.dataset.action, {
                method: 'POST',
                headers: { 'X-Requested-With': 'XMLHttpRequest', 'Accept': 'application/json' },
                body,
            });
            const data = await res.json();

            if (!res.ok) {
                if (res.status === 422 && data.errors) {
                    const fieldMap = {
                        name:        'create-name',
                        city:        'create-city',
                        province:    'create-province',
                        coordinates: 'create-coordinates',
                    };
                    const messages = [];
                    for (const [field, errs] of Object.entries(data.errors)) {
                        messages.push(...errs);
                        if (fieldMap[field]) document.getElementById(fieldMap[field]).classList.add('is-invalid');
                    }
                    createErrorBox.textContent = messages.join(' ');
                    createErrorBox.hidden = false;
                } else {
                    throw new Error(data.message || 'Something went wrong.');
                }
                setCreateLoading(false);
                return;
            }

            closeCreateModal();
            showToast('Barangay added successfully.');

            // Reload the table to reflect the new entry and updated stats
            fetch(window.location.href, { headers: { 'X-Requested-With': 'XMLHttpRequest' } })
                .then(r => r.text())
                .then(html => {
                    const parser   = new DOMParser();
                    const doc      = parser.parseFromString(html, 'text/html');
                    const newTable = doc.querySelector('.community-table-wrap');
                    const newPager = doc.querySelector('.community-pagination');
                    const newStats = doc.querySelector('.community-stats');

                    if (newTable) document.querySelector('.community-table-wrap').innerHTML = newTable.innerHTML;
                    if (newStats) document.querySelector('.community-stats').innerHTML = newStats.innerHTML;
                    if (newPager && document.querySelector('.community-pagination')) {
                        document.querySelector('.community-pagination').innerHTML = newPager.innerHTML;
                    }
                });

        } catch (err) {
            createErrorBox.textContent = err.message;
            createErrorBox.hidden = false;
            showToast(err.message, 'error');
        } finally {
            setCreateLoading(false);
        }
    });

    // ── View Modal ──────────────────────────────────────────────
    const viewOverlay = document.getElementById('view-modal');

    function openViewModal(barangay) {
        document.getElementById('view-name').textContent  = barangay.name;
        document.getElementById('view-city').textContent  = barangay.city;
        document.getElementById('view-province').textContent = barangay.province;

        const pinCount = parseInt(barangay.pins, 10);
        const pinBadge = document.getElementById('view-pins');
        pinBadge.textContent = pinCount > 0 ? `${pinCount} pin${pinCount !== 1 ? 's' : ''}` : 'No pins';
        pinBadge.className   = 'cbview-pin-badge' + (pinCount === 0 ? ' no-pins' : '');

        document.getElementById('view-pins-label').textContent = pinCount > 0
            ? `${pinCount} pin${pinCount !== 1 ? 's' : ''}`
            : 'None';

        viewOverlay.setAttribute('aria-hidden', 'false');
        viewOverlay.classList.add('is-open');
        document.body.style.overflow = 'hidden';
    }

    function closeViewModal() {
        viewOverlay.classList.remove('is-open');
        viewOverlay.setAttribute('aria-hidden', 'true');
        document.body.style.overflow = '';
    }

    document.addEventListener('click', function (e) {
        const viewBtn = e.target.closest('.action-btn--view');
        if (!viewBtn) return;
        e.preventDefault();

        openViewModal({
            id:       viewBtn.dataset.id,
            name:     viewBtn.dataset.name,
            city:     viewBtn.dataset.city,
            province: viewBtn.dataset.province,
            pins:     viewBtn.dataset.pins,
        });
    });

    document.getElementById('cbviewmodal-close').addEventListener('click', closeViewModal);
    document.getElementById('cbviewmodal-cancel').addEventListener('click', closeViewModal);

    viewOverlay.addEventListener('click', function (e) {
        if (e.target === viewOverlay) closeViewModal();
    });

    document.addEventListener('keydown', function (e) {
        if (e.key === 'Escape' && viewOverlay.classList.contains('is-open')) closeViewModal();
    });

    // ── Edit Modal ──────────────────────────────────────────────

    // ── Toast helper ────────────────────────────────────────────
    let toastTimer = null;

    function showToast(message, type = 'success') {
        let toast = document.getElementById('cb-toast');
        if (!toast) {
            toast = document.createElement('div');
            toast.id = 'cb-toast';
            toast.className = 'cbtoast';
            toast.setAttribute('role', 'status');
            toast.setAttribute('aria-live', 'polite');
            document.body.appendChild(toast);
        }

        const icon = type === 'success'
            ? `<svg class="cbtoast-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>`
            : `<svg class="cbtoast-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>`;

        toast.className = `cbtoast cbtoast--${type}`;
        toast.innerHTML = `${icon}<span>${message}</span>`;

        clearTimeout(toastTimer);
        requestAnimationFrame(() => {
            requestAnimationFrame(() => toast.classList.add('is-visible'));
        });

        toastTimer = setTimeout(() => {
            toast.classList.remove('is-visible');
        }, 3500);
    }

    const overlay   = document.getElementById('edit-modal');
    const form      = document.getElementById('edit-barangay-form');
    const errorBox  = document.getElementById('cbmodal-error');
    const saveBtn   = document.getElementById('cbmodal-save');
    const btnText   = saveBtn.querySelector('.cbmodal-btn-text');
    const btnSpinner = saveBtn.querySelector('.cbmodal-btn-spinner');

    function openEditModal(barangay) {
        document.getElementById('edit-name').value     = barangay.name;
        document.getElementById('edit-city').value     = barangay.city;
        document.getElementById('edit-province').value = barangay.province;

        form.dataset.action = `/admin/community/${barangay.id}`;

        errorBox.hidden = true;
        errorBox.textContent = '';
        document.querySelectorAll('.cbfield-input').forEach(i => i.classList.remove('is-invalid'));

        overlay.setAttribute('aria-hidden', 'false');
        overlay.classList.add('is-open');
        document.getElementById('edit-name').focus();
        document.body.style.overflow = 'hidden';
    }

    function closeEditModal() {
        overlay.classList.remove('is-open');
        overlay.setAttribute('aria-hidden', 'true');
        document.body.style.overflow = '';
    }

    function setLoading(loading) {
        saveBtn.disabled  = loading;
        btnText.hidden    = loading;
        btnSpinner.hidden = !loading;
    }

    // Open on edit button click — reads data from the table row
    document.addEventListener('click', function (e) {
        const editBtn = e.target.closest('.action-btn--edit');
        if (!editBtn) return;
        e.preventDefault();

        const row = editBtn.closest('tr');
        const barangay = {
            id:       editBtn.dataset.id,
            name:     editBtn.dataset.name,
            city:     editBtn.dataset.city,
            province: editBtn.dataset.province,
        };
        openEditModal(barangay);
    });

    document.getElementById('cbmodal-close').addEventListener('click', closeEditModal);
    document.getElementById('cbmodal-cancel').addEventListener('click', closeEditModal);

    overlay.addEventListener('click', function (e) {
        if (e.target === overlay) closeEditModal();
    });

    document.addEventListener('keydown', function (e) {
        if (e.key === 'Escape' && overlay.classList.contains('is-open')) closeEditModal();
    });

    form.addEventListener('submit', async function (e) {
        e.preventDefault();
        setLoading(true);
        errorBox.hidden = true;
        document.querySelectorAll('.cbfield-input').forEach(i => i.classList.remove('is-invalid'));

        const action = form.dataset.action;
        const body   = new FormData(form);

        try {
            const res  = await fetch(action, {
                method: 'POST',
                headers: { 'X-Requested-With': 'XMLHttpRequest', 'Accept': 'application/json' },
                body,
            });
            const data = await res.json();

            if (!res.ok) {
                if (res.status === 422 && data.errors) {
                    const fieldMap = { name: 'edit-name', city: 'edit-city', province: 'edit-province' };
                    const messages = [];
                    for (const [field, errs] of Object.entries(data.errors)) {
                        messages.push(...errs);
                        if (fieldMap[field]) document.getElementById(fieldMap[field]).classList.add('is-invalid');
                    }
                    errorBox.textContent = messages.join(' ');
                    errorBox.hidden = false;
                } else {
                    throw new Error(data.message || 'Something went wrong.');
                }
                setLoading(false);
                return;
            }

            // Update the row in-place without a page reload
            const b   = data.barangay;
            const row = document.querySelector(`.action-btn--edit[data-id="${b.id}"]`)?.closest('tr');
            if (row) {
                row.querySelector('.col-name').textContent = b.name;
                row.querySelector('.col-city').textContent = b.city;
                row.querySelector('.col-province').textContent = b.province;
                row.dataset.name = b.name.toLowerCase();

                const btn = row.querySelector('.action-btn--edit');
                btn.dataset.name     = b.name;
                btn.dataset.city     = b.city;
                btn.dataset.province = b.province;
            }

            closeEditModal();
            showToast('Barangay updated successfully.');
        } catch (err) {
            errorBox.textContent = err.message;
            errorBox.hidden = false;
            showToast('Failed to update barangay.', 'error');
        } finally {
            setLoading(false);
        }
    });

})();