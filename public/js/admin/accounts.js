(function () {
    'use strict';

    const csrf = window.CSRF_TOKEN;

    // ── Toast ────────────────────────────────────────────────────
    let toastTimer = null;

    function showToast(message, type = 'success') {
        let toast = document.getElementById('ac-toast');
        if (!toast) {
            toast = document.createElement('div');
            toast.id = 'ac-toast';
            toast.className = 'actoast';
            toast.setAttribute('role', 'status');
            document.body.appendChild(toast);
        }

        const icon = type === 'success'
            ? `<svg class="actoast-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>`
            : `<svg class="actoast-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>`;

        toast.className = `actoast actoast--${type}`;
        toast.innerHTML = `${icon}<span>${message}</span>`;
        clearTimeout(toastTimer);
        requestAnimationFrame(() => requestAnimationFrame(() => toast.classList.add('is-visible')));
        toastTimer = setTimeout(() => toast.classList.remove('is-visible'), 3500);
    }

    // ── Modal helpers ────────────────────────────────────────────
    function openOverlay(id) {
        const el = document.getElementById(id);
        el.setAttribute('aria-hidden', 'false');
        el.classList.add('is-open');
        document.body.style.overflow = 'hidden';
    }

    function closeOverlay(id) {
        const el = document.getElementById(id);
        el.classList.remove('is-open');
        el.setAttribute('aria-hidden', 'true');
        document.body.style.overflow = '';
    }

    document.querySelectorAll('.acmodal-overlay').forEach(overlay => {
        overlay.addEventListener('click', function (e) {
            if (e.target === overlay) closeOverlay(overlay.id);
        });
    });

   document.addEventListener('keydown', function (e) {
        if (e.key === 'Escape') {
            ['create-account-modal', 'toggle-account-modal'].forEach(closeOverlay);
        }
    });

    // ── Create Account Modal ─────────────────────────────────────
    const createForm    = document.getElementById('create-account-form');
    const createError   = document.getElementById('acmodal-error');
    const createSaveBtn = document.getElementById('acmodal-save');
    const createBtnText = createSaveBtn.querySelector('.acmodal-btn-text');
    const createBtnSpinner = createSaveBtn.querySelector('.acmodal-btn-spinner');

    document.getElementById('open-create-account').addEventListener('click', () => {
        createForm.reset();
        createError.hidden = true;
        createForm.querySelectorAll('.acfield-input').forEach(i => i.classList.remove('is-invalid'));
        openOverlay('create-account-modal');
        document.getElementById('ac-name').focus();
    });

    document.getElementById('acmodal-close').addEventListener('click',  () => closeOverlay('create-account-modal'));
    document.getElementById('acmodal-cancel').addEventListener('click', () => closeOverlay('create-account-modal'));

    // Password toggle
    document.getElementById('ac-toggle-password').addEventListener('click', function () {
        const input    = document.getElementById('ac-password');
        const icon     = document.getElementById('ac-eye-icon');
        const isPass   = input.type === 'password';
        input.type     = isPass ? 'text' : 'password';
        icon.innerHTML = isPass
            ? `<path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19m-6.72-1.07a3 3 0 11-4.24-4.24"/><line x1="1" y1="1" x2="23" y2="23"/>`
            : `<path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/>`;
    });

    function setCreateLoading(loading) {
        createSaveBtn.disabled    = loading;
        createBtnText.hidden      = loading;
        createBtnSpinner.hidden   = !loading;
    }

    createForm.addEventListener('submit', async function (e) {
        e.preventDefault();
        setCreateLoading(true);
        createError.hidden = true;
        createForm.querySelectorAll('.acfield-input').forEach(i => i.classList.remove('is-invalid'));

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
                    const fieldMap = { name: 'ac-name', email: 'ac-email', password: 'ac-password' };
                    const messages = [];
                    for (const [field, errs] of Object.entries(data.errors)) {
                        messages.push(...errs);
                        if (fieldMap[field]) document.getElementById(fieldMap[field]).classList.add('is-invalid');
                    }
                    createError.textContent = messages.join(' ');
                    createError.hidden = false;
                } else {
                    throw new Error(data.message || 'Something went wrong.');
                }
                setCreateLoading(false);
                return;
            }

            // Append new row to table
            const a   = data.account;
            const tbody = document.getElementById('accounts-tbody');
            const rowCount = tbody.querySelectorAll('tr').length + 1;
            const tr  = document.createElement('tr');
            tr.className = 'account-row';
            tr.dataset.id = a.id;
            tr.innerHTML = `
                <td class="col-num">${rowCount}</td>
                <td class="col-name">${a.name}</td>
                <td class="col-email">${a.email}</td>
                <td class="col-role"><span class="role-pill role-pill--admin">Admin</span></td>
                <td class="col-status"><span class="status-pill status-pill--active">Active</span></td>
                <td class="col-date">${a.created_at}</td>
                <td class="col-action">
                    <button class="ac-toggle-btn ac-toggle-btn--deactivate"
                        data-id="${a.id}" data-active="1" data-name="${a.name}">
                        Deactivate
                    </button>
                </td>`;
            tbody.appendChild(tr);

            closeOverlay('create-account-modal');
            showToast(`Account for ${a.name} created successfully.`);

        } catch (err) {
            createError.textContent = err.message;
            createError.hidden = false;
            showToast(err.message, 'error');
        } finally {
            setCreateLoading(false);
        }
    });
    
    // ── Toggle (Deactivate / Activate) Modal ────────────────────
    const toggleConfirm    = document.getElementById('ac-togglemodal-confirm');
    const toggleBtnText    = document.getElementById('ac-togglemodal-confirm-text');
    const toggleBtnSpinner = toggleConfirm.querySelector('.acmodal-btn-spinner');
    let toggleTarget       = null;

    function openToggleModal(id, name, isActive) {
        toggleTarget = { id, name, isActive };

        const isDeactivating = isActive === '1';
        const title   = document.getElementById('ac-toggle-modal-title');
        const warning = document.getElementById('ac-toggle-warning');
        const msg     = document.getElementById('ac-toggle-message');

        title.textContent = isDeactivating ? 'Deactivate Account' : 'Activate Account';
        msg.innerHTML     = isDeactivating
            ? `Are you sure you want to deactivate <strong>${name}</strong>? They will no longer be able to log in.`
            : `Are you sure you want to activate <strong>${name}</strong>? They will regain access to the portal.`;

        warning.className = `acmodal-warning ${isDeactivating ? 'acmodal-warning--deactivate' : 'acmodal-warning--activate'}`;
        toggleBtnText.textContent = isDeactivating ? 'Deactivate' : 'Activate';
        toggleConfirm.className = `acmodal-btn ${isDeactivating ? 'acmodal-btn--danger' : 'acmodal-btn--activate'}`;

        openOverlay('toggle-account-modal');
    }

    document.getElementById('ac-togglemodal-close').addEventListener('click',  () => closeOverlay('toggle-account-modal'));
    document.getElementById('ac-togglemodal-cancel').addEventListener('click', () => closeOverlay('toggle-account-modal'));

    document.addEventListener('click', function (e) {
        const btn = e.target.closest('.ac-toggle-btn');
        if (!btn) return;
        if (btn.classList.contains('ac-toggle-btn--password')) return;
        openToggleModal(btn.dataset.id, btn.dataset.name, btn.dataset.active);
    });

    function setToggleLoading(loading) {
        toggleConfirm.disabled   = loading;
        toggleBtnText.hidden     = loading;
        toggleBtnSpinner.hidden  = !loading;
    }

    toggleConfirm.addEventListener('click', async function () {
        if (!toggleTarget) return;
        setToggleLoading(true);

        try {
            const res  = await fetch(`/admin/accounts/${toggleTarget.id}/toggle`, {
                method: 'POST',
                headers: { 'X-Requested-With': 'XMLHttpRequest', 'Accept': 'application/json' },
                body: (() => {
                    const f = new FormData();
                    f.append('_method', 'PATCH');
                    f.append('_token', csrf);
                    return f;
                })(),
            });

            const data = await res.json();
            if (!res.ok) throw new Error(data.message || 'Something went wrong.');

            // Update the row in place
            const row    = document.querySelector(`.account-row[data-id="${toggleTarget.id}"]`);
            const isNowActive = data.is_active;

            row.querySelector('.status-pill').className   = `status-pill ${isNowActive ? 'status-pill--active' : 'status-pill--inactive'}`;
            row.querySelector('.status-pill').textContent = isNowActive ? 'Active' : 'Inactive';

            const btn = row.querySelector('.ac-toggle-btn');
            btn.className       = `ac-toggle-btn ${isNowActive ? 'ac-toggle-btn--deactivate' : 'ac-toggle-btn--activate'}`;
            btn.textContent     = isNowActive ? 'Deactivate' : 'Activate';
            btn.dataset.active  = isNowActive ? '1' : '0';

            const action = isNowActive ? 'activated' : 'deactivated';
            closeOverlay('toggle-account-modal');
            showToast(`${toggleTarget.name} has been ${action}.`);
            toggleTarget = null;

        } catch (err) {
            showToast(err.message, 'error');
        } finally {
            setToggleLoading(false);
        }
    });

})();