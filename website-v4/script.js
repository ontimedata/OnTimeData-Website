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

/* =========================================
   Hero mesh — decentralized AI workflow
   Distributed cyan nodes, peer-to-peer links,
   light "tasks" pulsing along the connections.
   Pure canvas. Pauses off-screen / hidden tab.
   ========================================= */
(function () {
  'use strict';

  const canvas = document.getElementById('heroMesh');
  const hero   = document.getElementById('top');
  if (!canvas || !hero) return;

  const ctx = canvas.getContext('2d');
  if (!ctx) return;

  const CYAN = '34,211,238';
  const prefersReduced = matchMedia('(prefers-reduced-motion: reduce)').matches;

  let dpr = Math.min(window.devicePixelRatio || 1, 2);
  let w = 0, h = 0;
  let nodes = [];
  let travelers = [];
  let vignette = null;       // edge fade for a clean, framed look
  const LINK_DIST = 160;     // px — connection threshold
  let rafId = 0;
  let visible = true;
  let onScreen = true;

  function rand(min, max) { return min + Math.random() * (max - min); }

  function build() {
    const rect = hero.getBoundingClientRect();
    w = Math.max(1, rect.width);
    h = Math.max(1, rect.height);
    dpr = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width  = Math.round(w * dpr);
    canvas.height = Math.round(h * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

    // Edge vignette: fades the mesh into the background toward the borders.
    vignette = ctx.createRadialGradient(
      w / 2, h / 2, Math.min(w, h) * 0.22,
      w / 2, h / 2, Math.max(w, h) * 0.72
    );
    vignette.addColorStop(0, 'rgba(6,6,14,0)');
    vignette.addColorStop(1, 'rgba(6,6,14,0.92)');

    // Node count scales with area, clamped for performance.
    const count = Math.max(34, Math.min(90, Math.round((w * h) / 22000)));
    nodes = [];
    for (let i = 0; i < count; i++) {
      const z = rand(0.35, 1);            // depth: 1 = near, 0.35 = far
      nodes.push({
        x: rand(0, w),
        y: rand(0, h),
        vx: rand(-0.16, 0.16) * z,
        vy: rand(-0.16, 0.16) * z,
        r: 0.8 + z * 1.8,                 // nearer nodes render larger
        z: z,
        ph: rand(0, Math.PI * 2),         // pulse phase
      });
    }

    // Travelers = "tasks" moving between adjacent nodes.
    const tCount = Math.max(8, Math.min(18, Math.round(count / 6)));
    travelers = [];
    for (let i = 0; i < tCount; i++) {
      const from = (Math.random() * nodes.length) | 0;
      travelers.push({ from, to: pickNear(from), t: Math.random(), spd: rand(0.004, 0.011) });
    }
  }

  function pickNear(from) {
    const a = nodes[from];
    let best = -1, bestD = Infinity;
    for (let i = 0; i < nodes.length; i++) {
      if (i === from) continue;
      const dx = nodes[i].x - a.x, dy = nodes[i].y - a.y;
      const d = dx * dx + dy * dy;
      if (d < bestD && Math.random() < 0.6) { bestD = d; best = i; }
    }
    return best === -1 ? (from + 1) % nodes.length : best;
  }

  function draw() {
    ctx.clearRect(0, 0, w, h);
    ctx.lineCap = 'round';

    // Connections — depth-aware, restrained opacity for a refined look
    for (let i = 0; i < nodes.length; i++) {
      const a = nodes[i];
      for (let j = i + 1; j < nodes.length; j++) {
        const b = nodes[j];
        const dx = a.x - b.x, dy = a.y - b.y;
        const dist = Math.hypot(dx, dy);
        if (dist < LINK_DIST) {
          const depth = (a.z + b.z) / 2;
          const o = (1 - dist / LINK_DIST) * 0.2 * depth;
          ctx.strokeStyle = 'rgba(' + CYAN + ',' + o.toFixed(3) + ')';
          ctx.lineWidth = 0.5 + depth * 0.7;
          ctx.beginPath();
          ctx.moveTo(a.x, a.y);
          ctx.lineTo(b.x, b.y);
          ctx.stroke();
        }
      }
    }

    // Nodes — depth drives size, brightness and glow (parallax feel)
    const now = performance.now() / 1000;
    for (let i = 0; i < nodes.length; i++) {
      const n = nodes[i];
      const glow = 0.5 + 0.5 * Math.sin(now * 1.4 + n.ph);
      const alpha = (0.22 + n.z * 0.5) * (0.7 + glow * 0.3);
      ctx.beginPath();
      ctx.arc(n.x, n.y, n.r, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(' + CYAN + ',' + alpha.toFixed(3) + ')';
      ctx.shadowColor = 'rgba(' + CYAN + ',0.9)';
      ctx.shadowBlur = (4 + glow * 8) * n.z;
      ctx.fill();
      ctx.shadowBlur = 0;
    }

    // Travelers — data packets with fading motion trails
    const TR = 5;
    for (let k = 0; k < travelers.length; k++) {
      const tr = travelers[k];
      const a = nodes[tr.from], b = nodes[tr.to];
      if (!a || !b) continue;
      const dirx = b.x - a.x, diry = b.y - a.y;

      for (let s = TR; s >= 1; s--) {
        const tt = Math.max(0, tr.t - s * 0.045);
        const fade = (1 - s / (TR + 1)) * 0.45;
        ctx.beginPath();
        ctx.arc(a.x + dirx * tt, a.y + diry * tt, 1.5, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(' + CYAN + ',' + fade.toFixed(3) + ')';
        ctx.fill();
      }

      ctx.beginPath();
      ctx.arc(a.x + dirx * tr.t, a.y + diry * tr.t, 2.4, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(190,245,255,0.98)';
      ctx.shadowColor = 'rgba(' + CYAN + ',1)';
      ctx.shadowBlur = 14;
      ctx.fill();
      ctx.shadowBlur = 0;
    }

    // Edge vignette — frames the mesh and blends it into the page
    if (vignette) {
      ctx.fillStyle = vignette;
      ctx.fillRect(0, 0, w, h);
    }
  }

  function step() {
    for (let i = 0; i < nodes.length; i++) {
      const n = nodes[i];
      n.x += n.vx; n.y += n.vy;
      if (n.x < 0 || n.x > w) n.vx *= -1;
      if (n.y < 0 || n.y > h) n.vy *= -1;
      n.x = Math.max(0, Math.min(w, n.x));
      n.y = Math.max(0, Math.min(h, n.y));
    }
    for (let k = 0; k < travelers.length; k++) {
      const tr = travelers[k];
      tr.t += tr.spd;
      if (tr.t >= 1) { tr.from = tr.to; tr.to = pickNear(tr.from); tr.t = 0; tr.spd = rand(0.004, 0.011); }
    }
  }

  function frame() {
    if (!visible || !onScreen) { rafId = 0; return; }
    step();
    draw();
    rafId = requestAnimationFrame(frame);
  }

  const start = () => { if (!rafId && visible && onScreen) rafId = requestAnimationFrame(frame); };
  const stop  = () => { if (rafId) cancelAnimationFrame(rafId); rafId = 0; };

  build();

  if (prefersReduced) {
    draw(); // static frame, no animation
    return;
  }

  document.addEventListener('visibilitychange', () => {
    visible = !document.hidden;
    if (visible) start(); else stop();
  });

  if ('IntersectionObserver' in window) {
    const io = new IntersectionObserver((entries) => {
      onScreen = entries[0].isIntersecting;
      if (onScreen) start(); else stop();
    }, { threshold: 0 });
    io.observe(hero);
  }

  let rt;
  addEventListener('resize', () => {
    clearTimeout(rt);
    rt = setTimeout(build, 200);
  }, { passive: true });

  start();
})();
