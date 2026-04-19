(function () {
    'use strict';

    const profileUrl  = window.SETTINGS_PROFILE_URL;
    const passwordUrl = window.SETTINGS_PASSWORD_URL;

    // ── Toast ────────────────────────────────────────────────────
    let toastTimer = null;

    function showToast(message, type = 'success') {
        let toast = document.getElementById('st-toast');
        if (!toast) {
            toast = document.createElement('div');
            toast.id = 'st-toast';
            toast.className = 'sttoast';
            toast.setAttribute('role', 'status');
            document.body.appendChild(toast);
        }

        const icon = type === 'success'
            ? `<svg class="sttoast-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>`
            : `<svg class="sttoast-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>`;

        toast.className = `sttoast sttoast--${type}`;
        toast.innerHTML = `${icon}<span>${message}</span>`;
        clearTimeout(toastTimer);
        requestAnimationFrame(() => requestAnimationFrame(() => toast.classList.add('is-visible')));
        toastTimer = setTimeout(() => toast.classList.remove('is-visible'), 3500);
    }

    // ── Helper ───────────────────────────────────────────────────
    function setLoading(btn, loading) {
        const text    = btn.querySelector('.stbtn-text');
        const spinner = btn.querySelector('.stbtn-spinner');
        btn.disabled  = loading;
        text.hidden   = loading;
        spinner.hidden = !loading;
    }

    function clearErrors(form, errorBox) {
        errorBox.hidden = true;
        errorBox.textContent = '';
        form.querySelectorAll('.stfield-input').forEach(i => i.classList.remove('is-invalid'));
    }

    function handleErrors(data, form, errorBox, fieldMap) {
        if (data.errors) {
            const messages = [];
            for (const [field, errs] of Object.entries(data.errors)) {
                messages.push(...errs);
                if (fieldMap[field]) document.getElementById(fieldMap[field]).classList.add('is-invalid');
            }
            errorBox.textContent = messages.join(' ');
            errorBox.hidden = false;
        } else {
            errorBox.textContent = data.message || 'Something went wrong.';
            errorBox.hidden = false;
        }
    }

    // ── Password toggles ─────────────────────────────────────────
    document.querySelectorAll('.st-pw-toggle').forEach(btn => {
        btn.addEventListener('click', function () {
            const input  = document.getElementById(this.dataset.target);
            const icon   = document.getElementById(this.dataset.icon);
            const isPass = input.type === 'password';
            input.type   = isPass ? 'text' : 'password';
            icon.innerHTML = isPass
                ? `<path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19m-6.72-1.07a3 3 0 11-4.24-4.24"/><line x1="1" y1="1" x2="23" y2="23"/>`
                : `<path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/>`;
        });
    });

    // ── Profile Form ─────────────────────────────────────────────
    const profileForm    = document.getElementById('profile-form');
    const profileError   = document.getElementById('profile-error');
    const profileSaveBtn = document.getElementById('profile-save-btn');

    profileForm.addEventListener('submit', async function (e) {
        e.preventDefault();
        setLoading(profileSaveBtn, true);
        clearErrors(profileForm, profileError);

        const body = new FormData(profileForm);
        body.append('_method', 'PATCH');

        try {
            const res  = await fetch(profileUrl, {
                method: 'POST',
                headers: { 'X-Requested-With': 'XMLHttpRequest', 'Accept': 'application/json' },
                body,
            });
            const data = await res.json();

            if (!res.ok) {
                handleErrors(data, profileForm, profileError, {
                    name:  'st-name',
                    email: 'st-email',
                });
                return;
            }

            // Update navbar avatar initials if name changed
            const avatar = document.getElementById('nav-avatar');
            if (avatar) {
                avatar.textContent = data.name.substring(0, 2).toUpperCase();
                avatar.title = data.name;
            }

            showToast('Profile updated successfully.');

        } catch (err) {
            profileError.textContent = err.message;
            profileError.hidden = false;
            showToast(err.message, 'error');
        } finally {
            setLoading(profileSaveBtn, false);
        }
    });

    // ── Password Form ────────────────────────────────────────────
    const passwordForm    = document.getElementById('password-form');
    const passwordError   = document.getElementById('password-error');
    const passwordSaveBtn = document.getElementById('password-save-btn');

    passwordForm.addEventListener('submit', async function (e) {
        e.preventDefault();
        setLoading(passwordSaveBtn, true);
        clearErrors(passwordForm, passwordError);

        const body = new FormData(passwordForm);
        body.append('_method', 'PATCH');

        try {
            const res  = await fetch(passwordUrl, {
                method: 'POST',
                headers: { 'X-Requested-With': 'XMLHttpRequest', 'Accept': 'application/json' },
                body,
            });
            const data = await res.json();

            if (!res.ok) {
                handleErrors(data, passwordForm, passwordError, {
                    current_password:      'st-current-password',
                    password:              'st-new-password',
                    password_confirmation: 'st-confirm-password',
                });
                return;
            }

            passwordForm.reset();
            showToast('Password updated successfully.');

        } catch (err) {
            passwordError.textContent = err.message;
            passwordError.hidden = false;
            showToast(err.message, 'error');
        } finally {
            setLoading(passwordSaveBtn, false);
        }
    });

})();