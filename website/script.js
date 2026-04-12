// =========================================
//   OnTimeData LLC — Website Scripts
// =========================================

// --- Sticky nav on scroll ---
const navHeader = document.getElementById('nav-header');
window.addEventListener('scroll', () => {
  if (window.scrollY > 20) {
    navHeader.classList.add('scrolled');
  } else {
    navHeader.classList.remove('scrolled');
  }
});

// --- Mobile menu toggle ---
const navToggle = document.getElementById('nav-toggle');
const mobileMenu = document.getElementById('mobile-menu');

navToggle.addEventListener('click', () => {
  mobileMenu.classList.toggle('open');
});

// Close mobile menu when a link is clicked
mobileMenu.querySelectorAll('a').forEach(link => {
  link.addEventListener('click', () => {
    mobileMenu.classList.remove('open');
  });
});

// --- Smooth scroll for anchor links ---
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
  anchor.addEventListener('click', function (e) {
    const target = document.querySelector(this.getAttribute('href'));
    if (target) {
      e.preventDefault();
      const offset = 70; // nav height
      const top = target.getBoundingClientRect().top + window.scrollY - offset;
      window.scrollTo({ top, behavior: 'smooth' });
    }
  });
});

// --- Contact form submission (mailto fallback) ---
const contactForm = document.getElementById('contact-form');
contactForm.addEventListener('submit', function (e) {
  e.preventDefault();

  const name    = document.getElementById('name').value.trim();
  const email   = document.getElementById('email').value.trim();
  const subject = document.getElementById('subject').value;
  const message = document.getElementById('message').value.trim();

  const subjectLine = subject
    ? `[OnTimeData.com] ${subject.charAt(0).toUpperCase() + subject.slice(1)} inquiry from ${name}`
    : `[OnTimeData.com] Inquiry from ${name}`;

  const body = `Name: ${name}\nEmail: ${email}\nTopic: ${subject || 'Not specified'}\n\nMessage:\n${message}`;

  const mailtoLink = `mailto:data@ontimedata.com?subject=${encodeURIComponent(subjectLine)}&body=${encodeURIComponent(body)}`;
  window.location.href = mailtoLink;
});

// --- Intersection Observer for fade-in animations ---
const observerOptions = {
  threshold: 0.1,
  rootMargin: '0px 0px -40px 0px'
};

const observer = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('visible');
      observer.unobserve(entry.target);
    }
  });
}, observerOptions);

// Add animation class to cards
document.querySelectorAll(
  '.service-card, .edu-card, .about-pillars .pillar, .contact-item'
).forEach((el, i) => {
  el.style.opacity = '0';
  el.style.transform = 'translateY(24px)';
  el.style.transition = `opacity 0.5s ease ${i * 0.07}s, transform 0.5s ease ${i * 0.07}s`;
  observer.observe(el);
});

// When visible, restore styles
const styleObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.style.opacity = '1';
      entry.target.style.transform = 'translateY(0)';
      styleObserver.unobserve(entry.target);
    }
  });
}, observerOptions);

document.querySelectorAll(
  '.service-card, .edu-card, .about-pillars .pillar, .contact-item'
).forEach(el => styleObserver.observe(el));
