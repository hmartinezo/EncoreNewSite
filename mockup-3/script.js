/* ============================================
   MOCKUP 3: CINEMATIC MINIMAL - Script
   Side nav dots, Ken Burns, horizontal scroll,
   floating register pill, scroll reveals
   ============================================ */

document.addEventListener('DOMContentLoaded', () => {
  'use strict';

  // --- Topbar scroll ---
  const topbar = document.getElementById('topbar');
  window.addEventListener('scroll', () => {
    topbar.classList.toggle('scrolled', window.scrollY > 60);
  }, { passive: true });

  // --- Smooth scroll for anchor links ---
  document.querySelectorAll('a[href^="#"]').forEach(link => {
    link.addEventListener('click', (e) => {
      const target = document.querySelector(link.getAttribute('href'));
      if (target) {
        e.preventDefault();
        target.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    });
  });

  // --- Cinematic Scroll Reveal (Intersection Observer) ---
  const revealObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('revealed');
        revealObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.15, rootMargin: '0px 0px -60px 0px' });

  document.querySelectorAll('.cin-reveal').forEach(el => revealObserver.observe(el));

  // --- Side Navigation Dots ---
  const sections = document.querySelectorAll('section[id]');
  const dots = document.querySelectorAll('#side-nav .dot');

  const dotObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        dots.forEach(d => d.classList.remove('active'));
        const active = document.querySelector(`#side-nav a[href="#${entry.target.id}"]`);
        if (active) active.classList.add('active');
      }
    });
  }, { threshold: 0.3 });

  sections.forEach(s => dotObserver.observe(s));

  // --- Floating Register Pill ---
  const pill = document.getElementById('register-pill');
  if (pill) {
    window.addEventListener('scroll', () => {
      pill.classList.toggle('visible', window.scrollY > window.innerHeight * 0.8);
    }, { passive: true });
  }

  // --- Horizontal Scroll Drag ---
  const hscroll = document.querySelector('.hscroll-container');
  if (hscroll) {
    let isDown = false, startX, scrollLeft;

    hscroll.addEventListener('mousedown', (e) => {
      isDown = true;
      hscroll.style.cursor = 'grabbing';
      startX = e.pageX - hscroll.offsetLeft;
      scrollLeft = hscroll.scrollLeft;
    });

    hscroll.addEventListener('mouseleave', () => { isDown = false; hscroll.style.cursor = 'grab'; });
    hscroll.addEventListener('mouseup', () => { isDown = false; hscroll.style.cursor = 'grab'; });

    hscroll.addEventListener('mousemove', (e) => {
      if (!isDown) return;
      e.preventDefault();
      const x = e.pageX - hscroll.offsetLeft;
      hscroll.scrollLeft = scrollLeft - (x - startX) * 1.5;
    });
  }
});
