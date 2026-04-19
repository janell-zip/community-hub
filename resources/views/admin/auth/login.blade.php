<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta name="csrf-token" content="{{ csrf_token() }}">
    <link rel="icon" href="{{ asset('img/spup_logo_alt.png') }}">
    <title>Login - SPUP-CDCFI Admin</title>

    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Sora:wght@400;500;600;700&family=Manrope:wght@300;400;500;600;700&display=swap" rel="stylesheet">

    <link rel="stylesheet" href="{{ asset('css/admin/admin.css') }}">
    <link rel="stylesheet" href="{{ asset('css/admin/login.css') }}">
</head>
<body class="login-body">

    <div class="login-wrap">

        <div class="login-card">

            <div class="login-brand">
                <img src="{{ asset('img/spup_logo_alt.png') }}" alt="SPUP CDC" class="login-logo">
                <div class="login-brand-text">
                    <span class="login-brand-name">Community Mapping &<br>Program Planning System</span>
                </div>
            </div>

            <div class="login-header">
                <h1 class="login-title">Welcome back!</h1>
                <p class="login-subtitle">Sign in to your account to continue</p>
            </div>

            <form class="login-form" id="login-form" method="POST">
                @csrf
                <div class="lfield">
                    <label class="lfield-label" for="login-email">Email</label>
                    <input class="lfield-input" type="email" id="login-email" name="email"
                        required autocomplete="email" placeholder="admin@spup-cdcfi.com">
                </div>
                <div class="lfield">
                    <label class="lfield-label" for="login-password">Password</label>
                    <div class="lfield-password-wrap">
                        <input class="lfield-input" type="password" id="login-password" name="password"
                            required autocomplete="current-password" placeholder="••••••••">
                        <button type="button" class="lfield-toggle" id="toggle-password" aria-label="Toggle password">
                            <svg id="eye-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                                <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/>
                            </svg>
                        </button>
                    </div>
                </div>
                @if ($errors->has('email'))
                <div class="login-error" id="login-error">{{ $errors->first('email') }}</div>
                @else
                <div class="login-error" id="login-error" hidden></div>
                @endif
                <button type="submit" class="login-btn" id="login-btn">
                    <span class="login-btn-text">Sign In</span>
                    <span class="login-btn-spinner" hidden>
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
                            <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83"/>
                        </svg>
                    </span>
                </button>
            </form>

        </div>

        <p class="login-footer">&copy; 2026 SPUP&ndash;Community Development Center Foundation Incorporated</p>

    </div>

    <script>
        const form      = document.getElementById('login-form');
        const errorBox  = document.getElementById('login-error');
        const loginBtn  = document.getElementById('login-btn');
        const btnText   = loginBtn.querySelector('.login-btn-text');
        const btnSpinner = loginBtn.querySelector('.login-btn-spinner');

        document.getElementById('toggle-password').addEventListener('click', function () {
            const input     = document.getElementById('login-password');
            const icon      = document.getElementById('eye-icon');
            const isPassword = input.type === 'password';
            input.type = isPassword ? 'text' : 'password';
            icon.innerHTML = isPassword
                ? `<path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19m-6.72-1.07a3 3 0 11-4.24-4.24"/><line x1="1" y1="1" x2="23" y2="23"/>`
                : `<path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/>`;
        });

        form.addEventListener('submit', async function (e) {
            e.preventDefault();
            loginBtn.disabled = true;
            btnText.hidden    = true;
            btnSpinner.hidden = false;
            errorBox.hidden   = true;

            const body = new FormData(form);

            try {
                const res  = await fetch('{{ route("admin.login.post") }}', {
                    method: 'POST',
                    headers: { 'X-Requested-With': 'XMLHttpRequest', 'Accept': 'application/json' },
                    body,
                });
                const data = await res.json();

                if (data.success) {
                    window.location.href = data.redirect;
                } else {
                    errorBox.textContent = data.message;
                    errorBox.hidden = false;
                    loginBtn.disabled = false;
                    btnText.hidden    = false;
                    btnSpinner.hidden = true;
                }
            } catch (err) {
                errorBox.textContent = 'Something went wrong. Please try again.';
                errorBox.hidden = false;
                loginBtn.disabled = false;
                btnText.hidden    = false;
                btnSpinner.hidden = true;
            }
        });
    </script>

</body>
</html>