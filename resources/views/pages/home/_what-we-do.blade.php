<section id="what-we-do">
    <div class="wwd-header">
        <p class="wwd-eyebrow">What We Do</p>
        <h2 class="wwd-headline">Our Programs</h2>
        <p class="wwd-subtext">
            The CES Program Components outline the key areas where SPUP promotes holistic development. 
            Rooted in the University&apos;s Vision&dash;Mission and the Paulinian Core Values, these components 
            guide all extension activities to ensure they are responsive, inclusive, and sustainable.
        </p>
    </div>

    <div class="wwd-slider-wrap">
        <button class="wwd-btn-prev" aria-label="Previous program">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"
                stroke-linejoin="round">
                <polyline points="15 18 9 12 15 6" />
            </svg>
        </button>

        <div class="wwd-slider" role="list">
            <article class="wwd-card" role="listitem"
                style="background-image: url('{{ asset('img/programs/values.jpg') }}')">
                <div class="wwd-card-overlay"></div>
                <div class="wwd-card-body">
                    <span class="wwd-card-tag">01</span>
                    <h3 class="wwd-card-title">Values &amp; Spiritual Formation</h3>
                    <div class="wwd-card-divider">
                        <span class="wwd-divider-dot"></span>
                    </div>
                    <p class="wwd-card-sub">This focuses on the development of the spiritual dimension of 
                        individuals and communities.</p>
                    <a href="{{ route('about') }}#values" class="wwd-card-link">
                        Learn more
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"
                            stroke-linecap="round" stroke-linejoin="round">
                            <line x1="5" y1="12" x2="19" y2="12" />
                            <polyline points="12 5 19 12 12 19" />
                        </svg>
                    </a>
                </div>
            </article>

            <article class="wwd-card" role="listitem"
                style="background-image: url('{{ asset('img/programs/political.jpg') }}')">
                <div class="wwd-card-overlay"></div>
                <div class="wwd-card-body">
                    <span class="wwd-card-tag">02</span>
                    <h3 class="wwd-card-title">Political Development</h3>
                    <div class="wwd-card-divider">
                        <span class="wwd-divider-dot"></span>
                    </div>
                    <p class="wwd-card-sub">This focuses on the  growth of the civic and 
                        participatory dimension of community life. </p>
                    <a href="{{ route('about') }}#political" class="wwd-card-link">
                        Learn more
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"
                            stroke-linecap="round" stroke-linejoin="round">
                            <line x1="5" y1="12" x2="19" y2="12" />
                            <polyline points="12 5 19 12 12 19" />
                        </svg>
                    </a>
                </div>
            </article>

            <article class="wwd-card" role="listitem"
                style="background-image: url('{{ asset('img/programs/economic.jpg') }}')">
                <div class="wwd-card-overlay"></div>
                <div class="wwd-card-body">
                    <span class="wwd-card-tag">03</span>
                    <h3 class="wwd-card-title">Economic Development</h3>
                    <div class="wwd-card-divider">
                        <span class="wwd-divider-dot"></span>
                    </div>
                    <p class="wwd-card-sub">This addresses community livelihoods by 
                        boosting income and improving resource management.</p>
                    <a href="{{ route('about') }}#economic" class="wwd-card-link">
                        Learn more
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"
                            stroke-linecap="round" stroke-linejoin="round">
                            <line x1="5" y1="12" x2="19" y2="12" />
                            <polyline points="12 5 19 12 12 19" />
                        </svg>
                    </a>
                </div>
            </article>

            <article class="wwd-card" role="listitem"
                style="background-image: url('{{ asset('img/programs/socio.jpg') }}')">
                <div class="wwd-card-overlay"></div>
                <div class="wwd-card-body">
                    <span class="wwd-card-tag">04</span>
                    <h3 class="wwd-card-title">Socio-Cultural Development</h3>
                    <div class="wwd-card-divider">
                        <span class="wwd-divider-dot"></span>
                    </div>
                        <p class="wwd-card-sub">This focuses on the enhancement of the social and cultural
                             dimensions of community life.</p>
                    <a href="{{ route('about') }}#sociocultural" class="wwd-card-link">
                        Learn more
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"
                            stroke-linecap="round" stroke-linejoin="round">
                            <line x1="5" y1="12" x2="19" y2="12" />
                            <polyline points="12 5 19 12 12 19" />
                        </svg>
                    </a>
                </div>
            </article>

            <article class="wwd-card" role="listitem"
                style="background-image: url('{{ asset('img/programs/ecological.jpg') }}')">
                <div class="wwd-card-overlay"></div>
                <div class="wwd-card-body">
                    <span class="wwd-card-tag">05</span>
                    <h3 class="wwd-card-title">Ecological Development</h3>
                    <div class="wwd-card-divider">
                        <span class="wwd-divider-dot"></span>
                    </div>
                    <p class="wwd-card-sub">This underscores the importance of care for creation and responsible environmental 
                        stewardship.</p>
                    <a href="{{ route('about') }}#ecological" class="wwd-card-link">
                        Learn more
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"
                            stroke-linecap="round" stroke-linejoin="round">
                            <line x1="5" y1="12" x2="19" y2="12" />
                            <polyline points="12 5 19 12 12 19" />
                        </svg>
                    </a>
                </div>
            </article>
        </div>

        <button class="wwd-btn-next" aria-label="Next program">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"
                stroke-linejoin="round">
                <polyline points="9 18 15 12 9 6" />
            </svg>
        </button>
    </div>

    <div class="wwd-dots" aria-label="Slider navigation"></div>

    <div class="wwd-footer-link">
        <a href="{{ route('about') }}#what-we-do" class="wwd-all-link">
            View all programs
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"
                stroke-linejoin="round">
                <line x1="5" y1="12" x2="19" y2="12" />
                <polyline points="12 5 19 12 12 19" />
            </svg>
        </a>
    </div>
</section>