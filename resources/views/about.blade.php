<!DOCTYPE html>
<html lang="en">

<head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>About - SPUP SPUP Community Development Center Foundation, Inc.</title>
    <script src="https://cdn.tailwindcss.com"></script>
    <link
        href="https://fonts.googleapis.com/css2?family=Sora:wght@400;500;600;700;800&family=Inter:wght@300;400;500;600&display=swap"
        rel="stylesheet" />
    <link rel="stylesheet" href="{{ asset('css/style.css') }}">
    <link rel="stylesheet" href="{{ asset('css/components/navbar.css') }}">
    <link rel="stylesheet" href="{{ asset('css/components/footer.css') }}">
    <link rel="stylesheet" href="{{ asset('css/about.css') }}">
</head>

<body>
    <x-navbar />

    <!-- HERO -->
    <section class="hero">
        <div class="hero-text">
            <h1>About Us</h1>
            <p>Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et
                dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip
                ex ea commodo consequat.</p>
            <button class="btn-green">
                Read More
                <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"
                    stroke-linejoin="round">
                    <path d="M3 8h10M9 4l4 4-4 4" />
                </svg>
            </button>
        </div>
        <div class="hero-img photo-placeholder">
            <img src="https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=700&q=80" alt="Team collaboration"
                onerror="this.style.display='none'" />
        </div>
    </section>

    <!-- MISSION-VISION -->
    <section class="mv-section">
        <div class="mv-card">
            <div class="mv-label">Mission</div>
            <h3 class="mv-heading">Your mission statement headline here</h3>
            <p class="mv-text">Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt
                ut labore et dolore magna aliqua. Ut enim ad minim veniam quis nostrud exercitation.</p>
        </div>
        <div class="mv-divider"></div>
        <div class="mv-card">
            <div class="mv-label">Vision</div>
            <h3 class="mv-heading">Your vision statement headline here</h3>
            <p class="mv-text">Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt
                ut labore et dolore magna aliqua. Ut enim ad minim veniam quis nostrud exercitation.</p>
        </div>
    </section>

    <!-- PROGRAMS -->
    <section class="program-wrap">
        <h1>What We Do</h1>
        <nav class="program-nav">
            <a href="#" data-tab="values" class="active">Values/Spiritual Formation</a>
            <a href="#" data-tab="political">Political Development</a>
            <a href="#" data-tab="economic">Economic Development</a>
            <a href="#" data-tab="sociocultural">Socio-Cultural Development</a>
            <a href="#" data-tab="ecological">Ecological Development</a>
        </nav>

        <div class="program-content">
            <!-- VALUES / SPIRITUAL FORMATION -->
            <div class="tab-panel active" data-panel="values">
                <h2>Values / Spiritual Formation</h2>
                <p class="tagline">Lorem ipsum dolor sit amet, consectetur adipiscing elit.</p>
                <p>Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore
                    et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut
                    aliquip ex ea commodo consequat.</p>
                <figure class="tab-figure">
                    <img src="https://images.unsplash.com/photo-1504052434569-70ad5836ab65?w=900&q=80"
                        alt="Values/Spiritual Formation" />
                    <figcaption>
                        <span>Caption describing this image or event goes here.</span>
                        <a href="https://facebook.com" target="_blank" rel="noopener" class="ext-link"
                            title="View Facebook post">
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none"
                                stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                                <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
                                <polyline points="15 3 21 3 21 9" />
                                <line x1="10" y1="14" x2="21" y2="3" />
                            </svg>
                        </a>
                    </figcaption>
                </figure>
            </div>

            <!-- POLITICAL DEVELOPMENT -->
            <div class="tab-panel" data-panel="political">
                <h2>Political Development</h2>
                <p class="tagline">Lorem ipsum dolor sit amet, consectetur adipiscing elit.</p>
                <p>Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore
                    et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut
                    aliquip ex ea commodo consequat.</p>
                <figure class="tab-figure">
                    <img src="https://images.unsplash.com/photo-1529107386315-e1a2ed48a620?w=900&q=80"
                        alt="Political Development" />
                    <figcaption>
                        <span>Caption describing this image or event goes here.</span>
                        <a href="https://facebook.com" target="_blank" rel="noopener" class="ext-link"
                            title="View Facebook post">
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none"
                                stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                                <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
                                <polyline points="15 3 21 3 21 9" />
                                <line x1="10" y1="14" x2="21" y2="3" />
                            </svg>
                        </a>
                    </figcaption>
                </figure>
            </div>

            <!-- ECONOMIC DEVELOPMENT -->
            <div class="tab-panel" data-panel="economic">
                <h2>Economic Development</h2>
                <p class="tagline">Lorem ipsum dolor sit amet, consectetur adipiscing elit.</p>
                <p>Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore
                    et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut
                    aliquip ex ea commodo consequat.</p>
                <figure class="tab-figure">
                    <img src="https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=900&q=80"
                        alt="Economic Development" />
                    <figcaption>
                        <span>Caption describing this image or event goes here.</span>
                        <a href="https://facebook.com" target="_blank" rel="noopener" class="ext-link"
                            title="View Facebook post">
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none"
                                stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                                <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
                                <polyline points="15 3 21 3 21 9" />
                                <line x1="10" y1="14" x2="21" y2="3" />
                            </svg>
                        </a>
                    </figcaption>
                </figure>
            </div>

            <!-- SOCIO-CULTURAL DEVELOPMENT -->
            <div class="tab-panel" data-panel="sociocultural">
                <h2>Socio-Cultural Development</h2>
                <p class="tagline">Lorem ipsum dolor sit amet, consectetur adipiscing elit.</p>
                <p>Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore
                    et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut
                    aliquip ex ea commodo consequat.</p>
                <figure class="tab-figure">
                    <img src="https://images.unsplash.com/photo-1511632765486-a01980e01a18?w=900&q=80"
                        alt="Socio-Cultural Development" />
                    <figcaption>
                        <span>Caption describing this image or event goes here.</span>
                        <a href="https://facebook.com" target="_blank" rel="noopener" class="ext-link"
                            title="View Facebook post">
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none"
                                stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                                <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
                                <polyline points="15 3 21 3 21 9" />
                                <line x1="10" y1="14" x2="21" y2="3" />
                            </svg>
                        </a>
                    </figcaption>
                </figure>
            </div>

            <!-- ECOLOGICAL DEVELOPMENT -->
            <div class="tab-panel" data-panel="ecological">
                <h2>Ecological Development</h2>
                <p class="tagline">Lorem ipsum dolor sit amet, consectetur adipiscing elit.</p>
                <p>Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore
                    et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut
                    aliquip ex ea commodo consequat.</p>
                <figure class="tab-figure">
                    <img src="https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=900&q=80"
                        alt="Ecological Development" />
                    <figcaption>
                        <span>Caption describing this image or event goes here.</span>
                        <a href="https://facebook.com" target="_blank" rel="noopener" class="ext-link"
                            title="View Facebook post">
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none"
                                stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                                <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
                                <polyline points="15 3 21 3 21 9" />
                                <line x1="10" y1="14" x2="21" y2="3" />
                            </svg>
                        </a>
                    </figcaption>
                </figure>
            </div>

        </div>
    </section>
    <x-footer></x-footer>

    <script src="{{ asset('js/components/navbar.js') }}"></script>
    <script src="{{ asset('js/about.js') }}"></script>
</body>

</html>