/* Zeyad Tarek — portfolio interactions (vanilla JS) */
(() => {
  const REDUCED = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const IS_TOUCH = window.matchMedia('(hover: none)').matches;

  /* ===== Scroll progress ===== */
  const progress = document.getElementById('scrollProgress');
  const updateProgress = () => {
    const h = document.documentElement;
    const scrolled = (h.scrollTop) / (h.scrollHeight - h.clientHeight);
    progress.style.width = (scrolled * 100) + '%';
  };
  window.addEventListener('scroll', updateProgress, { passive: true });
  updateProgress();

  /* ===== Header shrink ===== */
  const header = document.getElementById('siteHeader');
  const onScrollHeader = () => header.classList.toggle('scrolled', window.scrollY > 30);
  window.addEventListener('scroll', onScrollHeader, { passive: true });
  onScrollHeader();

  /* ===== Mobile menu ===== */
  const toggle = document.getElementById('menuToggle');
  const nav = document.getElementById('nav');
  toggle.addEventListener('click', () => {
    const open = nav.classList.toggle('open');
    toggle.setAttribute('aria-expanded', String(open));
    document.body.style.overflow = open ? 'hidden' : '';
  });
  nav.querySelectorAll('a').forEach(a => a.addEventListener('click', () => {
    if (nav.classList.contains('open')) {
      nav.classList.remove('open');
      toggle.setAttribute('aria-expanded', 'false');
      document.body.style.overflow = '';
    }
  }));

  /* ===== Active section + indicator ===== */
  const sections = document.querySelectorAll('main section[id]');
  const navLinks = Array.from(nav.querySelectorAll('a'));
  const indicator = document.getElementById('navIndicator');

  const setIndicator = (link) => {
    if (!link || window.innerWidth <= 900) { indicator.style.opacity = 0; return; }
    const r = link.getBoundingClientRect();
    const pr = nav.getBoundingClientRect();
    indicator.style.left = (r.left - pr.left) + 'px';
    indicator.style.width = r.width + 'px';
    indicator.style.opacity = 1;
  };

  const updateActive = () => {
    const y = window.scrollY + 140;
    let current = sections[0]?.id;
    sections.forEach(s => { if (s.offsetTop <= y) current = s.id; });
    let activeLink = null;
    navLinks.forEach(l => {
      const isA = l.getAttribute('href') === `#${current}`;
      l.classList.toggle('active', isA);
      if (isA) activeLink = l;
    });
    setIndicator(activeLink);
  };
  window.addEventListener('scroll', updateActive, { passive: true });
  window.addEventListener('resize', updateActive);
  updateActive();

  /* ===== Reveal on scroll ===== */
  const revealEls = [];
  document.querySelectorAll('.section, .glass-card, .contact-card, .cert-card, .channel-card, .hero-copy > *, .hero-visual').forEach(el => {
    el.setAttribute('data-reveal', '');
    revealEls.push(el);
  });
  const io = new IntersectionObserver((entries) => {
    entries.forEach(e => {
      if (e.isIntersecting) {
        e.target.classList.add('in');
        if (e.target.classList.contains('section')) e.target.classList.add('in-view');
        io.unobserve(e.target);
      }
    });
  }, { threshold: 0.12, rootMargin: '0px 0px -60px 0px' });
  revealEls.forEach(el => io.observe(el));

  /* Stagger cards inside each grid */
  document.querySelectorAll('.info-grid, .contact-grid, .cert-grid').forEach(grid => {
    Array.from(grid.children).forEach((c, i) => c.style.transitionDelay = `${i * 110}ms`);
  });

  /* ===== Custom cursor disabled (native cursor) ===== */

  /* ===== Magnetic buttons ===== */
  if (!IS_TOUCH && !REDUCED) {
    document.querySelectorAll('[data-magnetic]').forEach(el => {
      el.addEventListener('mousemove', e => {
        const r = el.getBoundingClientRect();
        const x = e.clientX - r.left - r.width / 2;
        const y = e.clientY - r.top - r.height / 2;
        el.style.transform = `translate(${x * 0.2}px, ${y * 0.25}px)`;
      });
      el.addEventListener('mouseleave', () => el.style.transform = '');
    });
  }

  /* ===== 3D tilt ===== */
  if (!IS_TOUCH && !REDUCED) {
    document.querySelectorAll('[data-tilt]').forEach(el => {
      el.style.transformStyle = 'preserve-3d';
      el.addEventListener('mousemove', e => {
        const r = el.getBoundingClientRect();
        const x = (e.clientX - r.left) / r.width - 0.5;
        const y = (e.clientY - r.top) / r.height - 0.5;
        el.style.transform = `perspective(900px) rotateX(${-y * 8}deg) rotateY(${x * 10}deg) translateY(-4px)`;
      });
      el.addEventListener('mouseleave', () => el.style.transform = '');
    });
  }

  /* ===== Scroll to top ===== */
  const toTop = document.getElementById('toTop');
  window.addEventListener('scroll', () => {
    toTop.classList.toggle('show', window.scrollY > 600);
  }, { passive: true });
  toTop.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));

  /* ===== Lightbox ===== */
  const lb = document.getElementById('lightbox');
  const lbImg = document.getElementById('lightboxImg');
  const lbClose = document.getElementById('lightboxClose');
  const openLb = (src, alt) => {
    lbImg.src = src; lbImg.alt = alt || '';
    lb.classList.add('open');
    lb.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
  };
  const closeLb = () => {
    lb.classList.remove('open');
    lb.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
  };
  document.querySelectorAll('.cert-card').forEach(c => {
    c.addEventListener('click', () => openLb(c.dataset.img, c.querySelector('img')?.alt));
  });
  lbClose.addEventListener('click', closeLb);
  lb.addEventListener('click', e => { if (e.target === lb) closeLb(); });
  document.addEventListener('keydown', e => { if (e.key === 'Escape') closeLb(); });

  /* ===== Hero title split reveal ===== */
  if (!REDUCED) {
    document.querySelectorAll('[data-split]').forEach((el, idx) => {
      el.style.opacity = '0';
      el.style.transform = 'translateY(100%)';
      el.style.transition = 'opacity 0.9s var(--ease), transform 0.9s var(--ease)';
      el.style.transitionDelay = (0.15 + idx * 0.12) + 's';
      requestAnimationFrame(() => {
        el.style.opacity = '1';
        el.style.transform = 'translateY(0)';
      });
    });
  }
})();
