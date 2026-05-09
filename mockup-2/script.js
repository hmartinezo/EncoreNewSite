/* ============================================
   MOCKUP 2: BRIGHT & BOLD - Script
   CSS animations + Intersection Observer
   ============================================ */

document.addEventListener('DOMContentLoaded', () => {
  'use strict';

  // --- Navbar scroll ---
  const navbar = document.getElementById('navbar');
  window.addEventListener('scroll', () => {
    navbar.classList.toggle('scrolled', window.scrollY > 60);
  }, { passive: true });

  // --- Smooth scroll ---
  document.querySelectorAll('a[href^="#"]').forEach(link => {
    link.addEventListener('click', (e) => {
      const target = document.querySelector(link.getAttribute('href'));
      if (target) {
        e.preventDefault();
        const navLinks = document.getElementById('nav-links');
        if (navLinks.classList.contains('active')) navLinks.classList.remove('active');
        target.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    });
  });

  // --- Scroll Reveal (Intersection Observer) ---
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('revealed');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.15, rootMargin: '0px 0px -40px 0px' });

  document.querySelectorAll('.scroll-reveal').forEach(el => observer.observe(el));

  // --- Stagger style pills ---
  const pills = document.querySelectorAll('.style-pill');
  pills.forEach((pill, i) => {
    pill.style.transitionDelay = `${i * 0.08}s`;
  });

  // --- Mobile sticky register show after scroll past hero ---
  const stickyRegister = document.getElementById('sticky-register');
  if (stickyRegister && window.innerWidth <= 768) {
    window.addEventListener('scroll', () => {
      stickyRegister.style.display = window.scrollY > window.innerHeight * 0.6 ? 'block' : 'none';
    }, { passive: true });
  }
});
