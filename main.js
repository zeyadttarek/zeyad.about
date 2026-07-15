/* ─── PORTFOLIO MAIN JS ─────────────────────────────────── */

const REDUCED_MOTION = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const IS_TOUCH = window.matchMedia('(pointer: coarse)').matches;

/* ══════════════════════════════════════════════════════════
   PARTICLE CANVAS
══════════════════════════════════════════════════════════ */
function initParticles() {
  const canvas = document.getElementById('particleCanvas');
  if (!canvas || REDUCED_MOTION) return;
  const ctx = canvas.getContext('2d');

  const COLORS = ['#00f5d4', '#ff6b6b', '#ffd60a', '#a8ff3e', '#c77dff'];
  const PARTICLE_COUNT = IS_TOUCH ? 24 : 40;
  const ENABLE_CONNECTIONS = !IS_TOUCH && window.innerWidth > 1400;
  let W, H, particles = [];
  let resizeTimeout;

  function resize() {
    W = canvas.width = window.innerWidth;
    H = canvas.height = window.innerHeight;
  }

  class Particle {
    constructor() { this.reset(true); }
    reset(initial = false) {
      this.x = Math.random() * W;
      this.y = initial ? Math.random() * H : H + 10;
      this.r = Math.random() * 1.8 + 0.4;
      this.color = COLORS[Math.floor(Math.random() * COLORS.length)];
      this.speed = Math.random() * 0.18 + 0.04;
      this.vx = (Math.random() - 0.5) * 0.15;
      this.alpha = Math.random() * 0.5 + 0.1;
      this.pulse = Math.random() * Math.PI * 2;
    }
    update() {
      this.y -= this.speed;
      this.x += this.vx;
      this.pulse += 0.012;
      this.alpha = (Math.sin(this.pulse) * 0.2 + 0.3);
      if (this.y < -10) this.reset();
    }
    draw() {
      ctx.save();
      ctx.globalAlpha = this.alpha;
      ctx.fillStyle = this.color;
      ctx.shadowColor = this.color;
      ctx.shadowBlur = 8;
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.r, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }
  }

  function buildParticles() {
    particles = Array.from({ length: PARTICLE_COUNT }, () => new Particle());
  }

  function drawConnections() {
    if (!ENABLE_CONNECTIONS) return;
    const maxDist = 80;
    ctx.lineWidth = 0.4;
    for (let i = 0; i < particles.length; i++) {
      for (let j = i + 1; j < particles.length; j++) {
        const dx = particles[i].x - particles[j].x;
        const dy = particles[i].y - particles[j].y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < maxDist) {
          ctx.globalAlpha = (1 - dist / maxDist) * 0.08;
          ctx.strokeStyle = particles[i].color;
          ctx.beginPath();
          ctx.moveTo(particles[i].x, particles[i].y);
          ctx.lineTo(particles[j].x, particles[j].y);
          ctx.stroke();
        }
      }
    }
    ctx.globalAlpha = 1;
  }

  let raf;
  function loop() {
    ctx.clearRect(0, 0, W, H);
    drawConnections();
    particles.forEach(p => { p.update(); p.draw(); });
    raf = requestAnimationFrame(loop);
  }

  resize();
  buildParticles();
  loop();
  window.addEventListener('resize', () => {
    clearTimeout(resizeTimeout);
    resizeTimeout = setTimeout(() => {
      resize();
      buildParticles();
    }, 150);
  });
}

/* ══════════════════════════════════════════════════════════
   CUSTOM CURSOR
══════════════════════════════════════════════════════════ */
function initCursor() {
  if (IS_TOUCH || REDUCED_MOTION) return;
  const cursor = document.getElementById('cursor');
  const trail = document.getElementById('cursorTrail');
  if (!cursor || !trail) return;

  let mx = 0, my = 0, tx = 0, ty = 0;

  window.addEventListener('mousemove', e => {
    mx = e.clientX; my = e.clientY;
    cursor.style.left = mx + 'px';
    cursor.style.top = my + 'px';
  });

  function trailLoop() {
    tx += (mx - tx) * 0.12;
    ty += (my - ty) * 0.12;
    trail.style.left = tx + 'px';
    trail.style.top = ty + 'px';
    requestAnimationFrame(trailLoop);
  }
  trailLoop();
}

/* ══════════════════════════════════════════════════════════
   SCROLL PROGRESS BAR
══════════════════════════════════════════════════════════ */
function initScrollProgress() {
  const bar = document.getElementById('scrollProgress');
  if (!bar) return;
  window.addEventListener('scroll', () => {
    const total = document.documentElement.scrollHeight - window.innerHeight;
    bar.style.width = total > 0 ? (window.scrollY / total * 100) + '%' : '0%';
  }, { passive: true });
}

/* ══════════════════════════════════════════════════════════
   HEADER: SHRINK + ACTIVE NAV
══════════════════════════════════════════════════════════ */
function initHeader() {
  const header = document.getElementById('header');
  const navLinks = document.querySelectorAll('.nav-link');
  const sections = document.querySelectorAll('section[id]');

  function update() {
    if (!header) return;
    header.classList.toggle('shrink', window.scrollY > 60);

    let current = '';
    sections.forEach(s => {
      if (window.scrollY >= s.offsetTop - 140) current = s.id;
    });
    navLinks.forEach(l => {
      const active = l.getAttribute('href') === `#${current}`;
      l.classList.toggle('active', active);
      active ? l.setAttribute('aria-current', 'page') : l.removeAttribute('aria-current');
    });
  }

  window.addEventListener('scroll', update, { passive: true });
  update();
}

/* ══════════════════════════════════════════════════════════
   MOBILE MENU
══════════════════════════════════════════════════════════ */
function initMobileMenu() {
  const toggle = document.getElementById('menuToggle');
  const nav = document.getElementById('nav');
  if (!toggle || !nav) return;

  toggle.addEventListener('click', () => {
    const expanded = toggle.getAttribute('aria-expanded') === 'true';
    toggle.setAttribute('aria-expanded', String(!expanded));
    nav.classList.toggle('open', !expanded);
  });

  nav.querySelectorAll('.nav-link').forEach(l => {
    l.addEventListener('click', () => {
      nav.classList.remove('open');
      toggle.setAttribute('aria-expanded', 'false');
    });
  });

  window.addEventListener('resize', () => {
    if (window.innerWidth > 768) {
      nav.classList.remove('open');
      toggle.setAttribute('aria-expanded', 'false');
    }
  });
}

/* ══════════════════════════════════════════════════════════
   TYPEWRITER
══════════════════════════════════════════════════════════ */
function initTypewriter() {
  const el = document.getElementById('typewriter');
  if (!el) return;
  const words = ['Front-End Developer', 'Freelancer', 'Web Designer', 'AI Explorer'];
  let wi = 0, ci = 0, deleting = false;

  function type() {
    const word = words[wi];
    if (!deleting) {
      el.textContent = word.slice(0, ci + 1);
      ci++;
      if (ci === word.length) {
        deleting = true;
        setTimeout(type, 1800);
        return;
      }
    } else {
      el.textContent = word.slice(0, ci - 1);
      ci--;
      if (ci === 0) {
        deleting = false;
        wi = (wi + 1) % words.length;
      }
    }
    setTimeout(type, deleting ? 60 : 100);
  }
  setTimeout(type, 800);
}

/* ══════════════════════════════════════════════════════════
   STAT COUNTER
══════════════════════════════════════════════════════════ */
function animateCounter(el, target) {
  const dur = 1800;
  const start = performance.now();
  function tick(now) {
    const t = Math.min((now - start) / dur, 1);
    const ease = 1 - Math.pow(1 - t, 3);
    el.textContent = Math.round(ease * target);
    if (t < 1) requestAnimationFrame(tick);
  }
  requestAnimationFrame(tick);
}

/* ══════════════════════════════════════════════════════════
   SKILL RINGS ANIMATION
══════════════════════════════════════════════════════════ */
function animateRings(container) {
  const circumference = 2 * Math.PI * 50;
  container.querySelectorAll('.skill-ring').forEach(ring => {
    const pct = parseInt(ring.dataset.percent) || 0;
    const color = ring.dataset.color || '#00f5d4';
    const fill = ring.querySelector('.ring-fill');
    const icon = ring.querySelector('.ring-icon');
    const pctEl = ring.querySelector('.ring-pct');
    if (!fill) return;

    fill.style.stroke = color;
    fill.style.filter = `drop-shadow(0 0 6px ${color})`;
    const offset = circumference - (pct / 100) * circumference;

    if (REDUCED_MOTION) {
      fill.style.strokeDashoffset = offset;
      if (pctEl) pctEl.textContent = pct + '%';
      if (icon) icon.style.color = color;
      return;
    }

    setTimeout(() => {
      fill.style.strokeDashoffset = offset;
      if (icon) icon.style.color = color;
      if (pctEl) {
        let current = 0;
        const dur = 1500;
        const start = performance.now();
        function tick(now) {
          const t = Math.min((now - start) / dur, 1);
          const ease = 1 - Math.pow(1 - t, 3);
          current = Math.round(ease * pct);
          pctEl.textContent = current + '%';
          if (t < 1) requestAnimationFrame(tick);
        }
        requestAnimationFrame(tick);
      }
    }, 300);
  });
}

/* ══════════════════════════════════════════════════════════
   3D TILT
══════════════════════════════════════════════════════════ */
function initTilt() {
  if (IS_TOUCH || REDUCED_MOTION) return;
  document.querySelectorAll('.tilt-card').forEach(card => {
    let rect = null;
    let mouseX = 0;
    let mouseY = 0;
    let needsUpdate = false;

    function updateTransform() {
      if (!needsUpdate) return;
      needsUpdate = false;
      if (!rect) rect = card.getBoundingClientRect();
      const x = mouseX - rect.left;
      const y = mouseY - rect.top;
      const rx = ((y / rect.height) - 0.5) * 12;
      const ry = ((x / rect.width) - 0.5) * -12;
      card.style.transform = `perspective(800px) rotateX(${rx}deg) rotateY(${ry}deg) translateY(-4px)`;
    }

    card.addEventListener('mousemove', e => {
      rect = card.getBoundingClientRect();
      mouseX = e.clientX;
      mouseY = e.clientY;
      needsUpdate = true;
      requestAnimationFrame(updateTransform);
    });

    card.addEventListener('mouseleave', () => {
      card.style.transform = '';
    });
  });
}

/* ══════════════════════════════════════════════════════════
   INTERSECTION OBSERVER
══════════════════════════════════════════════════════════ */
function initReveal() {
  let skillsAnimated = false;
  let statsAnimated = false;

  const io = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;

      const el = entry.target;
      el.classList.add('visible');

      // Animate stat counters when hero visible
      if (el.id === 'hero' && !statsAnimated) {
        statsAnimated = true;
        document.querySelectorAll('.stat-num').forEach(num => {
          animateCounter(num, parseInt(num.dataset.target) || 0);
        });
      }

      // Animate skill rings when skills section visible
      if (el.id === 'skills' && !skillsAnimated) {
        skillsAnimated = true;
        animateRings(el);
      }

      io.unobserve(el);
    });
  }, { threshold: 0.15 });

  document.querySelectorAll('.reveal-section, #hero').forEach(s => {
    io.observe(s);
  });
}

/* ══════════════════════════════════════════════════════════
   SPLIT HEADING ANIMATION
══════════════════════════════════════════════════════════ */
function initSplitHeadings() {
  if (REDUCED_MOTION) return;
  document.querySelectorAll('.split-heading').forEach(h => {
    const text = h.textContent;
    h.innerHTML = text.split('').map((ch, i) =>
      `<span style="display:inline-block;opacity:0;transform:translateY(20px);transition:opacity 0.5s ${i * 0.04}s,transform 0.5s ${i * 0.04}s">${ch === ' ' ? '&nbsp;' : ch}</span>`
    ).join('');

    const io = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (!entry.isIntersecting) return;
        h.querySelectorAll('span').forEach(span => {
          span.style.opacity = '1';
          span.style.transform = 'translateY(0)';
        });
        io.unobserve(h);
      });
    }, { threshold: 0.5 });
    io.observe(h);
  });
}

/* ══════════════════════════════════════════════════════════
   LIGHTBOX (CERTIFICATES)
══════════════════════════════════════════════════════════ */
function initLightbox() {
  const lb = document.getElementById('lightbox');
  const lbImg = document.getElementById('lbImg');
  const lbTitle = document.getElementById('lbTitle');
  const lbClose = document.getElementById('lbClose');
  const lbBackdrop = document.getElementById('lbBackdrop');
  if (!lb) return;

  function open(src, title) {
    lbImg.src = src;
    lbImg.alt = title;
    lbTitle.textContent = title;
    lb.classList.add('open');
    document.body.style.overflow = 'hidden';
    lbClose.focus();
  }

  function close() {
    lb.classList.remove('open');
    document.body.style.overflow = '';
    lbImg.src = '';
  }

  document.querySelectorAll('.cert-card').forEach(card => {
    card.addEventListener('click', () => {
      const loadedImg = card.querySelector('.cert-real-img');
      const src = loadedImg?.src || card.dataset.cert;
      const title = card.dataset.title || '';
      if (src) open(src, title);
    });
    card.addEventListener('keydown', e => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        card.click();
      }
    });
    card.setAttribute('tabindex', '0');
    card.setAttribute('role', 'button');
    card.setAttribute('aria-label', `View certificate: ${card.dataset.title || ''}`);
  });

  if (lbClose) lbClose.addEventListener('click', close);
  if (lbBackdrop) lbBackdrop.addEventListener('click', close);
  document.addEventListener('keydown', e => { if (e.key === 'Escape') close(); });
}

/* ══════════════════════════════════════════════════════════
   BACK TO TOP
══════════════════════════════════════════════════════════ */
function initBackToTop() {
  const btn = document.getElementById('backTop');
  if (!btn) return;

  window.addEventListener('scroll', () => {
    btn.classList.toggle('visible', window.scrollY > 400);
  }, { passive: true });

  btn.addEventListener('click', () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });
}

/* ══════════════════════════════════════════════════════════
   CARD ENTRANCE STAGGER (for about/contact/cert)
══════════════════════════════════════════════════════════ */
function initCardStagger() {
  const targets = '.about-card, .contact-card, .cert-card';
  const io = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      const cards = entry.target.querySelectorAll(targets);
      cards.forEach((card, i) => {
        setTimeout(() => {
          card.style.opacity = '1';
          card.style.transform = '';
        }, i * 120);
      });
      io.unobserve(entry.target);
    });
  }, { threshold: 0.1 });

  document.querySelectorAll('#about, #contact, #certificates').forEach(sec => {
    sec.querySelectorAll(targets).forEach(card => {
      card.style.opacity = '0';
      card.style.transform = 'translateY(32px)';
      card.style.transition = 'opacity 0.6s cubic-bezier(0.23,1,0.32,1), transform 0.6s cubic-bezier(0.23,1,0.32,1)';
    });
    io.observe(sec);
  });
}

/* ══════════════════════════════════════════════════════════
   AVATAR MOUSE PARALLAX
══════════════════════════════════════════════════════════ */
function initAvatarParallax() {
  if (IS_TOUCH || REDUCED_MOTION) return;
  const wrapper = document.getElementById('avatarWrapper');
  if (!wrapper) return;

  let rx = 0, ry = 0, trx = 0, trY = 0;

  window.addEventListener('mousemove', e => {
    const cx = window.innerWidth / 2;
    const cy = window.innerHeight / 2;
    rx = (e.clientY - cy) / cy * 8;
    ry = (e.clientX - cx) / cx * -8;
  });

  function loop() {
    trx += (rx - trx) * 0.06;
    trY += (ry - trY) * 0.06;
    wrapper.style.transform = `rotateX(${trx}deg) rotateY(${trY}deg)`;
    requestAnimationFrame(loop);
  }
  wrapper.style.transformStyle = 'preserve-3d';
  wrapper.style.perspective = '600px';
  loop();
}

/* ══════════════════════════════════════════════════════════
   IMAGE LOADING — PLACEHOLDER-FIRST
   Placeholder shows immediately. JS tries to load real file.
   If it loads successfully, it replaces the placeholder.
   When you add gogo.png / certifi1.jpg / certifi2.jpg next
   to index.html, they will automatically appear.
══════════════════════════════════════════════════════════ */
function tryLoadImage(src, onSuccess) {
  const probe = new Image();
  probe.onload = () => onSuccess(probe);
  probe.onerror = () => {}; // silently keep placeholder
  probe.src = src;
}

function initImageFallbacks() {
  // ── Avatar ──────────────────────────────────────────────
  const avatarFrame = document.getElementById('avatarFrame');
  if (avatarFrame) {
    tryLoadImage('portrait.png', (img) => {
      img.className = 'avatar-img';
      img.alt = 'Zeyad Tarek — Front-End Developer';
      avatarFrame.innerHTML = '';
      avatarFrame.appendChild(img);
    });
  }

  // ── Certificates ────────────────────────────────────────
  const certConfigs = [
    { wrapId: 'certWrap1', src: 'certifi1.jpg', alt: '1 Million Prompters Certificate' },
    { wrapId: 'certWrap2', src: 'certifi4.jpg', alt: 'Introduction to Modern AI Certificate' },
  ];

  certConfigs.forEach(({ wrapId, src, alt }) => {
    const wrap = document.getElementById(wrapId);
    if (!wrap) return;
    tryLoadImage(src, (img) => {
      // Keep the overlay but replace the placeholder with the real image
      const overlay = wrap.querySelector('.cert-overlay');
      img.className = 'cert-real-img';
      img.alt = alt;
      wrap.innerHTML = '';
      wrap.appendChild(img);
      if (overlay) wrap.appendChild(overlay);
    });
  });
}

/* ══════════════════════════════════════════════════════════
   SMOOTH SCROLL FOR ANCHOR LINKS
══════════════════════════════════════════════════════════ */
function initSmoothScroll() {
  document.querySelectorAll('a[href^="#"]').forEach(a => {
    a.addEventListener('click', e => {
      const target = document.querySelector(a.getAttribute('href'));
      if (target) {
        e.preventDefault();
        const offset = 80;
        window.scrollTo({ top: target.offsetTop - offset, behavior: 'smooth' });
      }
    });
  });
}

/* ══════════════════════════════════════════════════════════
   HERO SECTION INITIAL REVEAL
══════════════════════════════════════════════════════════ */
function initHeroReveal() {
  const hero = document.getElementById('hero');
  if (hero) {
    hero.style.opacity = '1';
    hero.style.transform = 'none';
  }
}

/* ══════════════════════════════════════════════════════════
   INIT ALL
══════════════════════════════════════════════════════════ */
document.addEventListener('DOMContentLoaded', () => {
  initImageFallbacks();
  initParticles();
  initCursor();
  initScrollProgress();
  initHeader();
  initMobileMenu();
  initTypewriter();
  initTilt();
  initReveal();
  initSplitHeadings();
  initLightbox();
  initBackToTop();
  initCardStagger();
  initAvatarParallax();
  initSmoothScroll();
  initHeroReveal();
});
