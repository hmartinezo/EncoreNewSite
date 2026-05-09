/**
 * Encore Performers - Lightweight Analytics Tracker
 * Tracks page views, clicks, scroll depth, navigation paths, session duration,
 * and stores everything in localStorage for the admin BI dashboard.
 */
(function () {
  'use strict';

  const LS_KEY = 'encore_analytics';
  const SESSION_KEY = 'encore_session';
  const MAX_EVENTS = 5000; // Cap to prevent localStorage overflow

  // --- Helpers ---
  function uid() {
    return Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
  }

  function getStore() {
    try {
      return JSON.parse(localStorage.getItem(LS_KEY)) || { events: [], sessions: [], paths: [] };
    } catch { return { events: [], sessions: [], paths: [] }; }
  }

  function saveStore(store) {
    // Trim if too large
    if (store.events.length > MAX_EVENTS) store.events = store.events.slice(-MAX_EVENTS);
    if (store.sessions.length > 1000) store.sessions = store.sessions.slice(-1000);
    if (store.paths.length > 2000) store.paths = store.paths.slice(-2000);
    try { localStorage.setItem(LS_KEY, JSON.stringify(store)); } catch { /* full */ }
  }

  function getPage() {
    const path = location.pathname;
    const parts = path.split('/').filter(Boolean);
    // Return friendly name
    if (parts.includes('mockup-1')) return 'Mockup 1 - Elegant Dark';
    if (parts.includes('mockup-2')) return 'Mockup 2 - Bright & Bold';
    if (parts.includes('mockup-3')) return 'Mockup 3 - Cinematic';
    if (parts.includes('mockup-4')) return 'Mockup 4 - Modern Clean';
    if (parts.includes('admin')) return 'Admin Dashboard';
    return path || '/';
  }

  function getSection() {
    const hash = location.hash.replace('#', '');
    return hash || 'hero';
  }

  function getDevice() {
    const w = window.innerWidth;
    if (w < 480) return 'mobile';
    if (w < 1024) return 'tablet';
    return 'desktop';
  }

  function getReferrer() {
    const ref = document.referrer;
    if (!ref) return 'direct';
    if (ref.includes('google')) return 'google';
    if (ref.includes('facebook') || ref.includes('fb.')) return 'facebook';
    if (ref.includes('instagram')) return 'instagram';
    if (ref.includes('tiktok')) return 'tiktok';
    if (ref.includes('github')) return 'github-pages';
    return 'other';
  }

  // --- Session Management ---
  function getSession() {
    try {
      const s = JSON.parse(sessionStorage.getItem(SESSION_KEY));
      if (s && s.id) return s;
    } catch { /* ignore */ }
    const session = {
      id: uid(),
      start: Date.now(),
      pages: [],
      device: getDevice(),
      referrer: getReferrer(),
      scrollDepths: {}
    };
    sessionStorage.setItem(SESSION_KEY, JSON.stringify(session));
    return session;
  }

  function updateSession(updates) {
    const session = getSession();
    Object.assign(session, updates);
    sessionStorage.setItem(SESSION_KEY, JSON.stringify(session));
    return session;
  }

  // --- Track Event ---
  function track(type, data) {
    const store = getStore();
    store.events.push({
      type,
      page: getPage(),
      section: getSection(),
      device: getDevice(),
      ts: Date.now(),
      date: new Date().toISOString().slice(0, 10),
      ...data
    });
    saveStore(store);
  }

  // --- Page View ---
  function trackPageView() {
    const session = getSession();
    const page = getPage();

    // Add to session path
    if (!session.pages.includes(page)) {
      session.pages.push(page);
      updateSession({ pages: session.pages });
    }

    track('pageview', { referrer: getReferrer() });

    // Record path
    const store = getStore();
    if (session.pages.length >= 2) {
      const from = session.pages[session.pages.length - 2];
      const to = page;
      store.paths.push({ from, to, ts: Date.now(), date: new Date().toISOString().slice(0, 10) });
      saveStore(store);
    }
  }

  // --- Click Tracking ---
  function trackClicks() {
    document.addEventListener('click', function (e) {
      const el = e.target.closest('a, button, .btn, .program-card, .camp-card, .style-tag, .nav-cta');
      if (!el) return;

      let label = '';
      if (el.classList.contains('nav-cta')) label = 'nav-register-btn';
      else if (el.classList.contains('btn-primary')) label = 'cta-primary: ' + (el.textContent || '').trim().slice(0, 40);
      else if (el.classList.contains('btn-white')) label = 'cta-white: ' + (el.textContent || '').trim().slice(0, 40);
      else if (el.classList.contains('btn-outline')) label = 'cta-outline: ' + (el.textContent || '').trim().slice(0, 40);
      else if (el.closest('.program-card')) label = 'program-card: ' + (el.closest('.program-card').querySelector('h3')?.textContent || '');
      else if (el.closest('.camp-card')) label = 'camp-card: ' + (el.closest('.camp-card').querySelector('h3')?.textContent || '');
      else if (el.classList.contains('style-tag')) label = 'style-tag: ' + el.textContent;
      else if (el.id === 'encore-chat-toggle') label = 'chatbot-open';
      else if (el.tagName === 'A') label = 'link: ' + (el.textContent || el.href || '').trim().slice(0, 50);
      else label = 'click: ' + (el.textContent || el.tagName).trim().slice(0, 40);

      track('click', { label });
    });
  }

  // --- Scroll Depth ---
  function trackScroll() {
    let maxDepth = 0;
    let ticking = false;

    window.addEventListener('scroll', function () {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(function () {
        const scrolled = window.scrollY;
        const docHeight = document.documentElement.scrollHeight - window.innerHeight;
        const pct = Math.round((scrolled / docHeight) * 100);

        if (pct > maxDepth) {
          maxDepth = pct;
          // Track at 25% milestones
          const milestones = [25, 50, 75, 100];
          milestones.forEach(m => {
            if (pct >= m && maxDepth - (pct - maxDepth) < m) {
              track('scroll', { depth: m });
            }
          });
        }

        // Track which section is visible
        const sections = document.querySelectorAll('section[id]');
        sections.forEach(sec => {
          const rect = sec.getBoundingClientRect();
          if (rect.top < window.innerHeight / 2 && rect.bottom > window.innerHeight / 2) {
            const session = getSession();
            if (!session.scrollDepths) session.scrollDepths = {};
            session.scrollDepths[sec.id] = (session.scrollDepths[sec.id] || 0) + 1;
            updateSession({ scrollDepths: session.scrollDepths });
          }
        });

        ticking = false;
      });
    });
  }

  // --- Session End (beforeunload) ---
  function trackSessionEnd() {
    window.addEventListener('beforeunload', function () {
      const session = getSession();
      const duration = Math.round((Date.now() - session.start) / 1000);
      const store = getStore();
      store.sessions.push({
        id: session.id,
        duration,
        pages: session.pages,
        pageCount: session.pages.length,
        device: session.device,
        referrer: session.referrer,
        exitPage: getPage(),
        date: new Date().toISOString().slice(0, 10),
        ts: Date.now()
      });
      saveStore(store);
    });
  }

  // --- Chatbot tracking ---
  function trackChatbot() {
    const chatObserver = new MutationObserver(function (mutations) {
      mutations.forEach(function (m) {
        m.addedNodes.forEach(function (node) {
          if (node.classList && node.classList.contains('encore-user')) {
            track('chatbot', { action: 'question', text: (node.textContent || '').slice(0, 80) });
          }
        });
      });
    });

    // Wait for chatbot to load
    const interval = setInterval(function () {
      const msgs = document.getElementById('encore-chat-messages');
      if (msgs) {
        chatObserver.observe(msgs, { childList: true });
        clearInterval(interval);
      }
    }, 1000);
  }

  // --- Seed demo data for dashboard ---
  function seedDemoData() {
    const store = getStore();
    if (store.events.length > 50) return; // Already has data

    const pages = ['Mockup 1 - Elegant Dark', 'Mockup 2 - Bright & Bold', 'Mockup 3 - Cinematic', 'Mockup 4 - Modern Clean'];
    const sections = ['hero', 'programs', 'styles', 'camps', 'testimonials', 'cta'];
    const devices = ['desktop', 'desktop', 'desktop', 'mobile', 'mobile', 'tablet'];
    const referrers = ['direct', 'direct', 'google', 'google', 'google', 'facebook', 'instagram', 'other'];
    const labels = [
      'cta-primary: Book a FREE Trial Class',
      'nav-register-btn',
      'program-card: Munchkins & Minis',
      'program-card: Juniors',
      'program-card: Teens',
      'camp-card: K-Pop Dance',
      'camp-card: Broadway Bound',
      'style-tag: Ballet & Pointe',
      'style-tag: Hip Hop',
      'chatbot-open',
      'cta-white: Book Your FREE Trial',
      'link: Parent Portal',
      'cta-outline: Explore Programs',
      'program-card: Musical Theatre',
      'style-tag: Contemporary'
    ];

    const now = Date.now();
    const DAY = 86400000;

    // Generate 30 days of data
    for (let d = 29; d >= 0; d--) {
      const date = new Date(now - d * DAY).toISOString().slice(0, 10);
      const dailyViews = 20 + Math.floor(Math.random() * 60);

      for (let v = 0; v < dailyViews; v++) {
        const page = pages[Math.floor(Math.random() * pages.length)];
        const device = devices[Math.floor(Math.random() * devices.length)];
        const referrer = referrers[Math.floor(Math.random() * referrers.length)];
        const ts = now - d * DAY + Math.floor(Math.random() * DAY);

        store.events.push({ type: 'pageview', page, section: 'hero', device, ts, date, referrer });

        // Some clicks
        if (Math.random() > 0.4) {
          const label = labels[Math.floor(Math.random() * labels.length)];
          const section = sections[Math.floor(Math.random() * sections.length)];
          store.events.push({ type: 'click', page, section, device, ts: ts + 5000, date, label });
        }

        // Some scrolls
        if (Math.random() > 0.3) {
          const depths = [25, 50, 75, 100];
          const depth = depths[Math.floor(Math.random() * depths.length)];
          store.events.push({ type: 'scroll', page, section: sections[Math.floor(Math.random() * sections.length)], device, ts: ts + 10000, date, depth });
        }

        // Occasional chatbot
        if (Math.random() > 0.85) {
          const questions = ['What classes do you offer?', 'How much are classes?', 'Do you have summer camps?', 'Where are you located?', 'What ages?', 'Free trial?', 'What is ETAP?', 'Ballet classes for 5 year old?'];
          store.events.push({ type: 'chatbot', page, section: 'chatbot', device, ts: ts + 15000, date, action: 'question', text: questions[Math.floor(Math.random() * questions.length)] });
        }
      }

      // Sessions
      const dailySessions = Math.floor(dailyViews * 0.7);
      for (let s = 0; s < dailySessions; s++) {
        const device = devices[Math.floor(Math.random() * devices.length)];
        const referrer = referrers[Math.floor(Math.random() * referrers.length)];
        const pageCount = 1 + Math.floor(Math.random() * 4);
        const sessionPages = [];
        for (let p = 0; p < pageCount; p++) {
          sessionPages.push(pages[Math.floor(Math.random() * pages.length)]);
        }

        store.sessions.push({
          id: uid(),
          duration: 15 + Math.floor(Math.random() * 300),
          pages: sessionPages,
          pageCount,
          device,
          referrer,
          exitPage: sessionPages[sessionPages.length - 1],
          date,
          ts: now - d * DAY + Math.floor(Math.random() * DAY)
        });
      }
    }

    // Paths
    const pathPairs = [
      ['Mockup 4 - Modern Clean', 'Mockup 4 - Modern Clean'],
      ['Mockup 1 - Elegant Dark', 'Mockup 2 - Bright & Bold'],
      ['Mockup 4 - Modern Clean', 'Mockup 1 - Elegant Dark'],
      ['Mockup 3 - Cinematic', 'Mockup 4 - Modern Clean'],
      ['Mockup 2 - Bright & Bold', 'Mockup 3 - Cinematic']
    ];
    for (let i = 0; i < 200; i++) {
      const pair = pathPairs[Math.floor(Math.random() * pathPairs.length)];
      const d = Math.floor(Math.random() * 30);
      store.paths.push({ from: pair[0], to: pair[1], ts: now - d * DAY, date: new Date(now - d * DAY).toISOString().slice(0, 10) });
    }

    saveStore(store);
  }

  // --- Init ---
  function init() {
    if (location.pathname.includes('admin')) return; // Don't track admin page
    seedDemoData();
    trackPageView();
    trackClicks();
    trackScroll();
    trackSessionEnd();
    trackChatbot();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
