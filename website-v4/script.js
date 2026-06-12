/* =========================================
   OnTimeData LLC — Website v4
   Vanilla JS. No frameworks, no jQuery.
   ========================================= */

(function () {
  'use strict';

  /* ---------- Sticky nav on scroll ---------- */
  const nav = document.getElementById('nav');
  const onScroll = () => {
    if (!nav) return;
    if (window.scrollY > 12) nav.classList.add('scrolled');
    else nav.classList.remove('scrolled');
  };
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  /* ---------- Mobile menu ---------- */
  const burger = document.getElementById('burger');
  const mobileMenu = document.getElementById('mobileMenu');
  if (burger && mobileMenu) {
    burger.addEventListener('click', () => {
      mobileMenu.classList.toggle('open');
    });
    mobileMenu.querySelectorAll('a').forEach((a) => {
      a.addEventListener('click', () => mobileMenu.classList.remove('open'));
    });
  }

  /* ---------- Accordions ---------- */
  document.querySelectorAll('[data-accordion]').forEach((accordion) => {
    const items = accordion.querySelectorAll('.acc-item');
    items.forEach((item) => {
      const trigger = item.querySelector('.acc-trigger');
      if (!trigger) return;
      trigger.addEventListener('click', () => {
        const isOpen = item.classList.contains('open');
        // Close siblings in same accordion
        items.forEach((sib) => {
          sib.classList.remove('open');
          const t = sib.querySelector('.acc-trigger');
          if (t) t.setAttribute('aria-expanded', 'false');
        });
        if (!isOpen) {
          item.classList.add('open');
          trigger.setAttribute('aria-expanded', 'true');
        }
      });
    });
  });

  /* ---------- Lost-Revenue Calculator ---------- */
  const leadsInput  = document.getElementById('leads');
  const dealInput   = document.getElementById('deal');
  const closeInput  = document.getElementById('close');
  const upliftInput = document.getElementById('uplift');
  const upliftVal   = document.getElementById('upliftVal');
  const lostMonth   = document.getElementById('lostMonth');
  const lostYear    = document.getElementById('lostYear');

  const fmt = (n) =>
    new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      maximumFractionDigits: 0,
    }).format(Math.max(0, Math.round(n)));

  function recalc() {
    if (!leadsInput || !dealInput || !closeInput || !upliftInput) return;

    const leads  = parseFloat(leadsInput.value)  || 0;
    const deal   = parseFloat(dealInput.value)   || 0;
    const close  = parseFloat(closeInput.value)  || 0; // current close rate %
    const uplift = parseFloat(upliftInput.value) || 0; // percentage-point uplift

    // Cap projected close rate at 100%.
    const newClose = Math.min(100, close + uplift);
    const upliftPoints = newClose - close;

    // Additional deals captured per month with AI engagement.
    const extraDeals = leads * (upliftPoints / 100);
    const monthLoss  = extraDeals * deal;
    const yearLoss   = monthLoss * 12;

    if (upliftVal)  upliftVal.textContent  = `+${uplift} pts`;
    if (lostMonth)  lostMonth.textContent  = fmt(monthLoss);
    if (lostYear)   lostYear.textContent   = fmt(yearLoss);
  }

  [leadsInput, dealInput, closeInput, upliftInput].forEach((el) => {
    if (!el) return;
    el.addEventListener('input', recalc);
    el.addEventListener('change', recalc);
  });
  recalc();

  /* ---------- Reveal-up on scroll ---------- */
  const revealTargets = document.querySelectorAll(
    '.section-header, .accordion, .calc, .steps, .industries-grid, .features-grid, .booking-embed'
  );
  revealTargets.forEach((el) => el.classList.add('reveal-up'));

  if ('IntersectionObserver' in window) {
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('visible');
            io.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.12, rootMargin: '0px 0px -40px 0px' }
    );
    revealTargets.forEach((el) => io.observe(el));
  } else {
    revealTargets.forEach((el) => el.classList.add('visible'));
  }

  /* ---------- Interactive background ----------
     Single rAF loop drives:
       • bright grid mask (--mx/--my CSS vars, brightens cells near cursor)
       • hero-blob parallax (opposite-direction translate3d on wrappers)
       • subtle grid scroll parallax
     Touch → JS no-op (grid-bright hidden by CSS, blobs keep CSS keyframe).
     Reduced-motion → bail; CSS handles static state.
  --------------------------------------------- */
  const gridBright = document.querySelector('.bg-grid-bright');
  if (gridBright) {
    const root      = document.documentElement;
    const blob1     = document.querySelector('[data-blob="1"]');
    const blob2     = document.querySelector('[data-blob="2"]');
    const gridBase  = document.querySelector('.bg-grid-base');

    const prefersReduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
    const isCoarse       = matchMedia('(pointer: coarse)').matches;

    if (!prefersReduced && !isCoarse) {
      let vw = innerWidth;
      let vh = innerHeight;
      let tx = vw / 2, ty = vh / 2;   // target (where the cursor is)
      let cx = tx,     cy = ty;        // current (lerped, where things draw)
      let sLast = scrollY;
      let sTarget = 0, sCur = 0;       // grid scroll-parallax offset
      let rafId = 0;
      let visible = !document.hidden;

      const lerp = (a, b, t) => a + (b - a) * t;

      function frame() {
        if (!visible) { rafId = 0; return; }

        cx = lerp(cx, tx, 0.12);
        cy = lerp(cy, ty, 0.12);

        root.style.setProperty('--mx', ((cx / vw) * 100) + '%');
        root.style.setProperty('--my', ((cy / vh) * 100) + '%');

        const ox = (cx / vw - 0.5) * 2;  // -1..1 from screen center
        const oy = (cy / vh - 0.5) * 2;
        if (blob1) blob1.style.transform =
          'translate3d(' + (-ox * 20) + 'px,' + (-oy * 20) + 'px,0)';
        if (blob2) blob2.style.transform =
          'translate3d(' + (-ox * 35) + 'px,' + (-oy * 35) + 'px,0)';

        sCur = lerp(sCur, sTarget, 0.1);
        sTarget *= 0.94; // decay back to rest when scroll stops
        const gp = '0 ' + sCur.toFixed(1) + 'px';
        if (gridBase)   gridBase.style.backgroundPosition   = gp;
        gridBright.style.backgroundPosition = gp;

        rafId = requestAnimationFrame(frame);
      }

      const start = () => { if (!rafId) rafId = requestAnimationFrame(frame); };
      const stop  = () => { if (rafId) cancelAnimationFrame(rafId); rafId = 0; };

      document.addEventListener('visibilitychange', () => {
        visible = !document.hidden;
        if (visible) start(); else stop();
      });

      addEventListener('resize', () => {
        vw = innerWidth; vh = innerHeight;
      }, { passive: true });

      addEventListener('mousemove', (e) => {
        tx = e.clientX; ty = e.clientY;
      }, { passive: true });

      addEventListener('scroll', () => {
        const y = scrollY;
        const d = y - sLast;
        sLast = y;
        // clamp ±10px max grid drift
        sTarget = Math.max(-10, Math.min(10, sTarget - d * 0.5));
      }, { passive: true });

      start();
    }
  }
})();
