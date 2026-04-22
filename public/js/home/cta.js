(function () {
  'use strict';

  const SPEED = 0.5;

  function initMarquee() {
    // ── STEP 1: Find elements ──────────────────────────────────────────────
    const section  = document.getElementById('cta');
    const original = section && section.querySelector('.cta-partners');

    console.log('[marquee] section found:', !!section);
    console.log('[marquee] .cta-partners found:', !!original);

    if (!original) return;

    const cards = Array.from(original.querySelectorAll('.cta-partner'));
    console.log('[marquee] cards found:', cards.length);
    if (!cards.length) return;

    // ── STEP 2: Build DOM ──────────────────────────────────────────────────
    const wrapper = document.createElement('div');
    wrapper.className = 'cta-marquee-wrapper';

    const inner = document.createElement('div');
    inner.className = 'cta-marquee-inner';

    function buildStrip() {
      const strip = document.createElement('div');
      strip.className = 'cta-marquee-strip';
      cards.forEach(card => strip.appendChild(card.cloneNode(true)));
      return strip;
    }

    const stripA = buildStrip();
    const stripB = buildStrip();

    inner.appendChild(stripA);
    inner.appendChild(stripB);
    wrapper.appendChild(inner);

    // ── STEP 3: Inject styles ──────────────────────────────────────────────
    const style = document.createElement('style');
    style.textContent = `
      .cta-marquee-wrapper {
        width: 100%;
        overflow: hidden;
        -webkit-mask-image: linear-gradient(to right, transparent 0%, #000 7%, #000 93%, transparent 100%);
        mask-image: linear-gradient(to right, transparent 0%, #000 7%, #000 93%, transparent 100%);
      }
      .cta-marquee-inner {
        display: flex;
        width: max-content;
        will-change: transform;
      }
      .cta-marquee-strip {
        display: flex;
        gap: 1rem;
        padding: 0.25rem 0.5rem;
      }
      .cta-marquee-strip .cta-partner {
        flex: 0 0 140px !important;
        width: 140px !important;
        display: flex !important;
      }
      @media (max-width: 768px) {
        .cta-marquee-strip .cta-partner { flex: 0 0 110px !important; width: 110px !important; }
      }
      @media (max-width: 480px) {
        .cta-marquee-strip .cta-partner { flex: 0 0 90px !important; width: 90px !important; }
      }
    `;
    document.head.appendChild(style);

    // ── STEP 4: Replace original element ──────────────────────────────────
    original.replaceWith(wrapper);
    console.log('[marquee] wrapper inserted into DOM:', document.contains(wrapper));

    // ── STEP 5: Reduced motion check ──────────────────────────────────────
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      console.log('[marquee] STOPPED: prefers-reduced-motion is set');
      return;
    }

    let offset    = 0;
    let paused    = false;
    let rafId     = null;
    let loopWidth = 0;

    function tick() {
      if (!paused) {
        offset += SPEED;
        if (offset >= loopWidth) offset -= loopWidth;
        inner.style.transform = `translateX(-${offset}px)`;
      }
      rafId = requestAnimationFrame(tick);
    }

    function startTicker() {
      loopWidth = stripA.scrollWidth;
      console.log('[marquee] startTicker called — stripA.scrollWidth:', loopWidth);

      if (!loopWidth) {
        console.log('[marquee] scrollWidth is 0, retrying...');
        requestAnimationFrame(startTicker);
        return;
      }

      console.log('[marquee] loopWidth set to', loopWidth, '— starting tick');
      rafId = requestAnimationFrame(tick);
    }

    // ── STEP 6: Event listeners ────────────────────────────────────────────
    wrapper.addEventListener('mouseenter', () => { paused = true;  });
    wrapper.addEventListener('mouseleave', () => { paused = false; });

    wrapper.addEventListener('touchstart', () => { paused = true;  }, { passive: true });
    wrapper.addEventListener('touchend',   () => {
      setTimeout(() => { paused = false; }, 1200);
    }, { passive: true });

    // ── STEP 7: Start ──────────────────────────────────────────────────────
    if (document.readyState === 'complete') {
      console.log('[marquee] page already loaded — calling startTicker immediately');
      startTicker();
    } else {
      console.log('[marquee] waiting for window load event...');
      window.addEventListener('load', startTicker);
    }

    window.addEventListener('unload', () => cancelAnimationFrame(rafId));
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initMarquee);
  } else {
    initMarquee();
  }
})();