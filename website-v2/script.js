// =========================================
//   OnTimeData LLC — Website v2 Scripts
// =========================================

// --- Sticky nav ---
const nav = document.getElementById('nav');
window.addEventListener('scroll', () => {
  nav.classList.toggle('scrolled', window.scrollY > 20);
});

// --- Mobile burger menu ---
const burger = document.getElementById('burger');
const mobileNav = document.getElementById('mobile-nav');
burger.addEventListener('click', () => mobileNav.classList.toggle('open'));
mobileNav.querySelectorAll('a').forEach(a => {
  a.addEventListener('click', () => mobileNav.classList.remove('open'));
});

// --- Smooth scroll ---
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
  anchor.addEventListener('click', function (e) {
    const target = document.querySelector(this.getAttribute('href'));
    if (target) {
      e.preventDefault();
      const top = target.getBoundingClientRect().top + window.scrollY - 68;
      window.scrollTo({ top, behavior: 'smooth' });
    }
  });
});

// --- Accordion ---
document.querySelectorAll('.acc-trigger').forEach(trigger => {
  trigger.addEventListener('click', () => {
    const item = trigger.closest('.acc-item');
    const isOpen = item.classList.contains('open');

    // Close all
    document.querySelectorAll('.acc-item').forEach(i => i.classList.remove('open'));
    trigger.setAttribute('aria-expanded', 'false');

    // Open clicked (toggle)
    if (!isOpen) {
      item.classList.add('open');
      trigger.setAttribute('aria-expanded', 'true');
    }
  });
});

// --- Contact form ---
document.getElementById('contact-form').addEventListener('submit', function (e) {
  e.preventDefault();
  const name    = document.getElementById('name').value.trim();
  const email   = document.getElementById('email').value.trim();
  const subject = document.getElementById('subject').value;
  const message = document.getElementById('message').value.trim();

  const subjectLine = subject
    ? `[OnTimeData.com] ${subject.charAt(0).toUpperCase() + subject.slice(1)} inquiry from ${name}`
    : `[OnTimeData.com] Inquiry from ${name}`;

  const body = `Name: ${name}\nEmail: ${email}\nTopic: ${subject || 'Not specified'}\n\nMessage:\n${message}`;
  window.location.href = `mailto:data@ontimedata.com?subject=${encodeURIComponent(subjectLine)}&body=${encodeURIComponent(body)}`;
});

// --- Fade-up on scroll ---
const fadeEls = document.querySelectorAll('.vcard, .svc, .acc-item, .cdetail, .hstat');
const io = new IntersectionObserver((entries) => {
  entries.forEach((entry, i) => {
    if (entry.isIntersecting) {
      entry.target.style.transitionDelay = `${i * 0.06}s`;
      entry.target.classList.add('visible');
      io.unobserve(entry.target);
    }
  });
}, { threshold: 0.1, rootMargin: '0px 0px -32px 0px' });

fadeEls.forEach(el => {
  el.classList.add('fade-up');
  io.observe(el);
});
