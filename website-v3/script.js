/* =========================================
   OnTimeData LLC — Website v3 Scripts
   Particles · Counters · Animations
   ========================================= */

'use strict';

// ─── PARTICLE SYSTEM ─────────────────────────────────────────────────────────
class Particles {
  constructor() {
    this.canvas = document.getElementById('particle-canvas');
    this.ctx    = this.canvas.getContext('2d');
    this.nodes  = [];
    this.mouse  = { x: -9999, y: -9999 };
    this.colors = [
      '34,211,238',   // cyan
      '167,139,250',  // purple
      '251,191,36',   // amber
    ];
    this.raf    = null;

    this.resize();
    this.spawn();
    this.bindEvents();
    this.loop();
  }

  resize() {
    this.canvas.width  = window.innerWidth;
    this.canvas.height = window.innerHeight;
  }

  spawn() {
    const { width, height } = this.canvas;
    const count = Math.min(100, Math.floor(width * height / 13000));
    this.nodes  = [];

    for (let i = 0; i < count; i++) {
      const colorIdx = Math.floor(Math.random() * this.colors.length);
      this.nodes.push({
        x:          Math.random() * width,
        y:          Math.random() * height,
        vx:         (Math.random() - .5) * .45,
        vy:         (Math.random() - .5) * .45,
        r:          Math.random() * 1.6 + .6,
        color:      this.colors[colorIdx],
        opacity:    Math.random() * .45 + .2,
        phase:      Math.random() * Math.PI * 2,
        phaseSpeed: (.5 + Math.random() * .5) * .018,
      });
    }
  }

  bindEvents() {
    window.addEventListener('resize', () => {
      this.resize();
      this.spawn();
    });
    window.addEventListener('mousemove', e => {
      this.mouse.x = e.clientX;
      this.mouse.y = e.clientY;
    });
    window.addEventListener('touchmove', e => {
      const t = e.touches[0];
      this.mouse.x = t.clientX;
      this.mouse.y = t.clientY;
    }, { passive: true });
    window.addEventListener('mouseleave', () => {
      this.mouse.x = -9999;
      this.mouse.y = -9999;
    });
  }

  loop() {
    const { ctx, canvas, nodes } = this;
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    const maxConn = 130;
    const mouseR  = 150;

    // connections
    for (let i = 0; i < nodes.length; i++) {
      for (let j = i + 1; j < nodes.length; j++) {
        const dx = nodes[i].x - nodes[j].x;
        const dy = nodes[i].y - nodes[j].y;
        const d  = Math.sqrt(dx * dx + dy * dy);
        if (d >= maxConn) continue;

        const alpha = (1 - d / maxConn) * .22;
        ctx.beginPath();
        ctx.moveTo(nodes[i].x, nodes[i].y);
        ctx.lineTo(nodes[j].x, nodes[j].y);
        ctx.strokeStyle = `rgba(${nodes[i].color},${alpha})`;
        ctx.lineWidth   = .7;
        ctx.stroke();
      }
    }

    // nodes
    nodes.forEach(n => {
      // mouse repulsion
      const mdx = n.x - this.mouse.x;
      const mdy = n.y - this.mouse.y;
      const md  = Math.sqrt(mdx * mdx + mdy * mdy);
      if (md < mouseR && md > 0) {
        const f = (1 - md / mouseR) * .025;
        n.vx += (mdx / md) * f;
        n.vy += (mdy / md) * f;
      }

      // velocity damping
      n.vx *= .988;
      n.vy *= .988;

      n.x += n.vx;
      n.y += n.vy;

      // bounce
      if (n.x < 0)            { n.x = 0;            n.vx *= -1; }
      if (n.x > canvas.width) { n.x = canvas.width; n.vx *= -1; }
      if (n.y < 0)            { n.y = 0;            n.vy *= -1; }
      if (n.y > canvas.height){ n.y = canvas.height;n.vy *= -1; }

      // pulse
      n.phase += n.phaseSpeed;
      const op   = n.opacity + Math.sin(n.phase) * .12;
      const size = n.r + Math.sin(n.phase) * .35;

      // draw with glow
      ctx.save();
      ctx.shadowBlur  = 10;
      ctx.shadowColor = `rgba(${n.color},.7)`;
      ctx.beginPath();
      ctx.arc(n.x, n.y, Math.max(0, size), 0, Math.PI * 2);
      ctx.fillStyle = `rgba(${n.color},${Math.max(0, Math.min(1, op))})`;
      ctx.fill();
      ctx.restore();
    });

    this.raf = requestAnimationFrame(() => this.loop());
  }
}

// ─── COUNTER ANIMATION ───────────────────────────────────────────────────────
function animateCounter(el) {
  const target   = parseInt(el.dataset.target, 10);
  const duration = 2200;
  const started  = performance.now();

  function update(now) {
    const t = Math.min((now - started) / duration, 1);
    // Ease out expo
    const eased = t === 1 ? 1 : 1 - Math.pow(2, -10 * t);
    el.textContent = Math.round(eased * target);
    if (t < 1) requestAnimationFrame(update);
    else el.textContent = target;
  }
  requestAnimationFrame(update);
}

// ─── SCROLL REVEAL ───────────────────────────────────────────────────────────
function initScrollReveal() {
  const revealEls = document.querySelectorAll('.reveal-up');

  const io = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      entry.target.classList.add('visible');
      io.unobserve(entry.target);
    });
  }, { threshold: .12, rootMargin: '0px 0px -40px 0px' });

  revealEls.forEach(el => io.observe(el));
}

// ─── COUNTER TRIGGER ─────────────────────────────────────────────────────────
function initCounters() {
  const counters = document.querySelectorAll('.counter');

  const io = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      animateCounter(entry.target);
      io.unobserve(entry.target);
    });
  }, { threshold: .5 });

  counters.forEach(c => io.observe(c));
}

// ─── ACCORDION ───────────────────────────────────────────────────────────────
function initAccordion() {
  document.querySelectorAll('.acc-trigger').forEach(trigger => {
    trigger.addEventListener('click', () => {
      const item   = trigger.closest('.acc-item');
      const isOpen = item.classList.contains('open');

      // Close all
      document.querySelectorAll('.acc-item').forEach(i => {
        i.classList.remove('open');
        i.querySelector('.acc-trigger').setAttribute('aria-expanded', 'false');
      });

      // Open clicked
      if (!isOpen) {
        item.classList.add('open');
        trigger.setAttribute('aria-expanded', 'true');
      }
    });
  });
}

// ─── NAV ─────────────────────────────────────────────────────────────────────
function initNav() {
  const nav = document.getElementById('nav');
  window.addEventListener('scroll', () => {
    nav.classList.toggle('scrolled', window.scrollY > 24);
  }, { passive: true });

  // Mobile menu
  const burger     = document.getElementById('burger');
  const mobileMenu = document.getElementById('mobile-menu');
  burger.addEventListener('click', () => mobileMenu.classList.toggle('open'));
  mobileMenu.querySelectorAll('a').forEach(a => {
    a.addEventListener('click', () => mobileMenu.classList.remove('open'));
  });
}

// ─── SMOOTH SCROLL ───────────────────────────────────────────────────────────
function initSmoothScroll() {
  document.querySelectorAll('a[href^="#"]').forEach(a => {
    a.addEventListener('click', function (e) {
      const target = document.querySelector(this.getAttribute('href'));
      if (!target) return;
      e.preventDefault();
      const top = target.getBoundingClientRect().top + window.scrollY - 68;
      window.scrollTo({ top, behavior: 'smooth' });
    });
  });
}

// ─── CONTACT FORM ────────────────────────────────────────────────────────────
function initContactForm() {
  document.getElementById('contact-form').addEventListener('submit', function (e) {
    e.preventDefault();
    const name    = document.getElementById('name').value.trim();
    const email   = document.getElementById('email').value.trim();
    const subject = document.getElementById('subject').value;
    const message = document.getElementById('message').value.trim();

    const sub  = subject
      ? `[OnTimeData.com] ${subject.charAt(0).toUpperCase() + subject.slice(1)} inquiry from ${name}`
      : `[OnTimeData.com] Inquiry from ${name}`;
    const body = `Name: ${name}\nEmail: ${email}\nTopic: ${subject || 'Not specified'}\n\nMessage:\n${message}`;

    window.location.href =
      `mailto:data@ontimedata.com?subject=${encodeURIComponent(sub)}&body=${encodeURIComponent(body)}`;
  });
}

// ─── CARD STAGGER DELAYS ─────────────────────────────────────────────────────
function initCardDelays() {
  // Services cards already have --delay via inline style
  // Add stagger to contact links
  document.querySelectorAll('.clink').forEach((el, i) => {
    el.style.setProperty('--delay', `${i * 0.08}s`);
    el.classList.add('reveal-up');
  });
}

// ─── HERO ENTRANCE ───────────────────────────────────────────────────────────
function initHeroEntrance() {
  // Immediately mark hero elements visible (they're above fold)
  requestAnimationFrame(() => {
    document.querySelectorAll('.hero .reveal-up').forEach(el => {
      el.classList.add('visible');
    });
  });
}

// ─── BOOT ────────────────────────────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
  new Particles();
  initNav();
  initSmoothScroll();
  initScrollReveal();
  initCounters();
  initAccordion();
  initContactForm();
  initCardDelays();
  initHeroEntrance();
});
