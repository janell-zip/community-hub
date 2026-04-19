<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta name="csrf-token" content="{{ csrf_token() }}">
    <link rel="icon" href="{{ asset('img/spup_logo_alt.png') }}">
    <title>@yield('title', 'Admin — SPUP-CDCFI')</title>

    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Sora:wght@400;500;600;700&family=Manrope:wght@300;400;500;600;700&display=swap" rel="stylesheet">

    <link rel="stylesheet" href="{{ asset('css/admin/admin.css') }}">
    <link rel="stylesheet" href="{{ asset('css/admin/navbar.css') }}">

    @stack('styles')
</head>
<body class="admin-body">
    <nav class="admin-nav" id="admin-nav">
        <a class="admin-nav-brand" href="{{ route('admin.map') }}">
            <img src="{{ asset('img/spup_logo_alt.png') }}" alt="SPUP CDC" class="admin-nav-logo">
            <div class="admin-nav-brand-text">
                <span class="admin-nav-brand-name">SPUP&dash;CDCFI</span>
                <span class="admin-nav-brand-sub">Admin Portal</span>
            </div>
        </a>

        <div class="admin-nav-divider"></div>

        <!-- Nav links -->
        <ul class="admin-nav-links">
            <li>
                <a href="{{ route('admin.map') }}" class="{{ request()->routeIs('admin.map') ? 'active' : '' }}">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round">
                        <path d="M21 10c0 7-9 13-9 13S3 17 3 10a9 9 0 0118 0z"/><circle cx="12" cy="10" r="3"/>
                    </svg>
                    <span>Map</span>
                    <span class="nav-beta-tag" title="This feature is a work in progress. Accuracy of map data and placement may vary.">Beta</span>
                </a>
            </li>
            <li>
                <a href="{{ route('admin.community') }}" class="{{ request()->routeIs('admin.community') ? 'active' : '' }}">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round">
                        <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75"/>
                    </svg>
                    <span>Community</span>
                </a>
            </li>
            <li>
                <a href="{{ route('admin.programs') }}" class="{{ request()->routeIs('admin.programs') ? 'active' : '' }}">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round">
                        <path d="M16 4h2a2 2 0 012 2v14a2 2 0 01-2 2H6a2 2 0 01-2-2V6a2 2 0 012-2h2"/><rect x="8" y="2" width="8" height="4" rx="1" ry="1"/>
                    </svg>
                    <span>Programs</span>
                </a>
            </li>
            <li>
                <a href="{{ route('admin.budget') }}" class="{{ request()->routeIs('admin.budget') ? 'active' : '' }}">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round">
                        <line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/>
                    </svg>
                    <span>Budget</span>
                </a>
            </li>
            @if(auth()->user()?->isSuperAdmin())
            <li>
                <a href="{{ route('admin.accounts') }}" class="{{ request()->routeIs('admin.accounts') ? 'active' : '' }}">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round">
                        <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/><circle cx="9" cy="7" r="4"/>
                        <path d="M23 21v-2a4 4 0 00-3-3.87"/><path d="M16 3.13a4 4 0 010 7.75"/>
                        <line x1="19" y1="8" x2="19" y2="14"/><line x1="22" y1="11" x2="16" y2="11"/>
                    </svg>
                    <span>Accounts</span>
                </a>
            </li>
            @endif
            <li>
                <a href="{{ route('admin.settings') }}" class="{{ request()->routeIs('admin.settings') ? 'active' : '' }}">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round">
                        <circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-4 0v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83-2.83l.06-.06A1.65 1.65 0 004.68 15a1.65 1.65 0 00-1.51-1H3a2 2 0 010-4h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 012.83-2.83l.06.06A1.65 1.65 0 009 4.68a1.65 1.65 0 001-1.51V3a2 2 0 014 0v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 2.83l-.06.06A1.65 1.65 0 0019.4 9a1.65 1.65 0 001.51 1H21a2 2 0 010 4h-.09a1.65 1.65 0 00-1.51 1z"/>
                    </svg>
                    <span>Settings</span>
                </a>
            </li>
        </ul>

        <div class="admin-nav-spacer"></div>

        <div class="admin-nav-actions">
            <!-- Avatar and User Dropdown -->
            <div class="admin-nav-avatar-wrap" id="nav-avatar-wrap">
                <div class="admin-nav-avatar" id="nav-avatar" title="{{ auth()->user()->name }}">
                    {{ strtoupper(substr(auth()->user()->name, 0, 2)) }}
                </div>
                <div class="admin-nav-user-dropdown" id="nav-user-dropdown" hidden>
                    <div class="nav-user-info">
                        <span class="nav-user-name">{{ auth()->user()->name }}</span>
                        <span class="nav-user-email">{{ auth()->user()->email }}</span>
                        <span class="nav-user-role">{{ auth()->user()->role === 'super_admin' ? 'Super Admin' : 'Admin' }}</span>
                    </div>
                    <form method="POST" action="{{ route('admin.logout') }}">
                        @csrf
                        <button type="submit" class="nav-logout-btn">
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                                <path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/>
                            </svg>
                            Sign Out
                        </button>
                    </form>
                </div>
            </div>
        </div>

    </nav>

    <main class="admin-main" id="admin-main">
        @yield('content')
    </main>

    <script src="{{ asset('js/admin/navbar.js') }}" defer></script>
    @stack('scripts')
</body>
</html>