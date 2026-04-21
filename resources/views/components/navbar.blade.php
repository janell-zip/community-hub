@props([
    'transparent' => true,
    'solid'       => false,
])

<nav id="navbar" class="{{ $solid ? 'scrolled' : '' }}" aria-label="Main navigation">
    <a href="/" class="nav-brand">
        <div class="nav-logo">
            <img src="{{ asset('img/spup_logo.png') }}" alt="SPUP CDC Logo">
        </div>
        <div class="nav-org-name">
            St. Paul University Philippines
            <span>Community Development Center, Inc.</span> 
        </div>
    </a>

    <ul class="nav-links" id="nav-links" role="list">
        <li>
            <a href="/" class="{{ request()->is('/') ? 'active' : '' }}">Home</a>
        </li>

        <li>
            <a href="/about" class="{{ request()->is('about') ? 'active' : '' }}">About</a>
        </li>

        <li>
            <a href="/programs" class="{{ request()->is('programs') ? 'active' : '' }}">Programs &amp; Events</a>
        </li>

        <!-- Backup for future dropdown implementation
        <li class="has-dropdown">
            <button type="button" aria-haspopup="true" aria-expanded="false">
                Resources <span class="caret" aria-hidden="true"></span>
            </button>
            <div class="dropdown-menu" role="menu">
                <a href="#" role="menuitem">News &amp; Updates</a>
                <a href="#" role="menuitem">Gallery</a>
                <a href="#" role="menuitem">Annual Reports</a>
            </div>
        </li>
        -->

        <li>
            <a href="https://www.facebook.com/p/SPUP-Community-Development-Center-Foundation-Inc-100069385013106/" class="nav-cta" target="_blank">Get Involved</a>
        </li>

    </ul>

    <button class="nav-hamburger" id="nav-hamburger" aria-label="Toggle navigation" aria-expanded="false" aria-controls="nav-links">
        <span class="bar"></span>
        <span class="bar"></span>
        <span class="bar"></span>
    </button>
</nav>
<div class="nav-overlay" id="nav-overlay" aria-hidden="true"></div>