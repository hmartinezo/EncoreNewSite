/* ============================================
   MOCKUP 1: ELEGANT DARK - Script
   GSAP ScrollTrigger animations + interactions
   ============================================ */

document.addEventListener('DOMContentLoaded', () => {
  'use strict';

  // --- Navbar scroll effect ---
  const navbar = document.getElementById('navbar');
  const floatingCta = document.getElementById('floating-cta');
  let lastScroll = 0;

  window.addEventListener('scroll', () => {
    const scrollY = window.scrollY;
    navbar.classList.toggle('scrolled', scrollY > 80);

    // Show floating CTA after scrolling past hero
    if (floatingCta) {
      floatingCta.classList.toggle('visible', scrollY > window.innerHeight * 0.8);
    }

    lastScroll = scrollY;
  }, { passive: true });

  // --- Smooth scroll for nav links ---
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

  // --- GSAP ScrollTrigger Animations ---
  if (typeof gsap !== 'undefined' && typeof ScrollTrigger !== 'undefined') {
    gsap.registerPlugin(ScrollTrigger);

    // Reveal animations
    document.querySelectorAll('.reveal-up, .reveal-left, .reveal-right').forEach(el => {
      ScrollTrigger.create({
        trigger: el,
        start: 'top 85%',
        onEnter: () => el.classList.add('revealed'),
        once: true
      });
    });

    // Stat counter animation
    document.querySelectorAll('.stat-number').forEach(el => {
      const target = parseInt(el.dataset.target);
      ScrollTrigger.create({
        trigger: el,
        start: 'top 85%',
        onEnter: () => {
          gsap.to(el, {
            duration: 2,
            innerText: target,
            snap: { innerText: 1 },
            ease: 'power2.out'
          });
        },
        once: true
      });
    });

    // Parallax on hero
    gsap.to('.hero-video', {
      yPercent: 30,
      ease: 'none',
      scrollTrigger: {
        trigger: '#hero',
        start: 'top top',
        end: 'bottom top',
        scrub: true
      }
    });

    // Stagger program cards
    gsap.utils.toArray('.program-card').forEach((card, i) => {
      ScrollTrigger.create({
        trigger: card,
        start: 'top 85%',
        onEnter: () => {
          gsap.fromTo(card,
            { opacity: 0, y: 40 },
            { opacity: 1, y: 0, duration: 0.6, delay: i * 0.1, ease: 'power2.out' }
          );
        },
        once: true
      });
    });

    // Stagger summer cards
    gsap.utils.toArray('.summer-card').forEach((card, i) => {
      ScrollTrigger.create({
        trigger: card,
        start: 'top 85%',
        onEnter: () => {
          gsap.fromTo(card,
            { opacity: 0, y: 30 },
            { opacity: 1, y: 0, duration: 0.5, delay: i * 0.1, ease: 'power2.out' }
          );
        },
        once: true
      });
    });

    // Stagger pillars
    gsap.utils.toArray('.pillar').forEach((pillar, i) => {
      ScrollTrigger.create({
        trigger: pillar,
        start: 'top 85%',
        onEnter: () => {
          gsap.fromTo(pillar,
            { opacity: 0, y: 30 },
            { opacity: 1, y: 0, duration: 0.5, delay: i * 0.12, ease: 'power2.out' }
          );
        },
        once: true
      });
    });

  } else {
    // Fallback: just reveal everything if GSAP isn't loaded
    document.querySelectorAll('.reveal-up, .reveal-left, .reveal-right').forEach(el => {
      el.classList.add('revealed');
    });
    document.querySelectorAll('.stat-number').forEach(el => {
      el.textContent = el.dataset.target;
    });
  }

  // --- Testimonials Carousel ---
  const track = document.getElementById('testimonial-track');
  const dotsContainer = document.getElementById('testimonial-dots');

  if (track && dotsContainer) {
    const cards = track.querySelectorAll('.testimonial-card');
    let currentSlide = 0;

    // Create dots
    cards.forEach((_, i) => {
      const dot = document.createElement('button');
      dot.setAttribute('aria-label', `Testimonial ${i + 1}`);
      if (i === 0) dot.classList.add('active');
      dot.addEventListener('click', () => goToSlide(i));
      dotsContainer.appendChild(dot);
    });

    function goToSlide(index) {
      currentSlide = index;
      track.style.transform = `translateX(-${index * 100}%)`;
      dotsContainer.querySelectorAll('button').forEach((d, i) => {
        d.classList.toggle('active', i === index);
      });
    }

    // Auto-advance
    setInterval(() => {
      goToSlide((currentSlide + 1) % cards.length);
    }, 6000);
  }
});
