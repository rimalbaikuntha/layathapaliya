(() => {
  // Year
  document.getElementById('year').textContent = new Date().getFullYear();

  // Nav: scrolled state
  const nav = document.getElementById('nav');
  const onScroll = () => nav.classList.toggle('is-scrolled', window.scrollY > 20);
  onScroll();
  window.addEventListener('scroll', onScroll, { passive: true });

  // Mobile menu
  const toggle = document.getElementById('navToggle');
  const links = document.getElementById('navLinks');
  const setMenu = (open) => {
    links.classList.toggle('is-open', open);
    toggle.setAttribute('aria-expanded', String(open));
    toggle.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
    document.body.style.overflow = open ? 'hidden' : '';
  };
  toggle.addEventListener('click', () => setMenu(!links.classList.contains('is-open')));
  links.querySelectorAll('a').forEach(a => a.addEventListener('click', () => setMenu(false)));
  document.addEventListener('keydown', e => { if (e.key === 'Escape') setMenu(false); });

  // Reveal on scroll (staggered within groups)
  const reveals = document.querySelectorAll('.reveal');
  if ('IntersectionObserver' in window) {
    const io = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (!entry.isIntersecting) return;
        const el = entry.target;
        const siblings = [...el.parentElement.children].filter(c => c.classList.contains('reveal'));
        el.style.transitionDelay = `${Math.min(siblings.indexOf(el), 5) * 80}ms`;
        el.classList.add('is-visible');
        io.unobserve(el);
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });
    reveals.forEach(el => io.observe(el));
  } else {
    reveals.forEach(el => el.classList.add('is-visible'));
  }

  // Count-up numbers
  const counters = document.querySelectorAll('[data-count]');
  const countIO = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      const el = entry.target, target = +el.dataset.count, start = performance.now();
      const step = (now) => {
        const p = Math.min((now - start) / 1400, 1);
        el.textContent = Math.round(target * (1 - Math.pow(1 - p, 3)));
        if (p < 1) requestAnimationFrame(step);
      };
      requestAnimationFrame(step);
      countIO.unobserve(el);
    });
  }, { threshold: 0.6 });
  counters.forEach(c => countIO.observe(c));

  // Active nav link
  const sections = [...document.querySelectorAll('main section[id]')];
  const navAnchors = [...links.querySelectorAll('a[href^="#"]')];
  const secIO = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      navAnchors.forEach(a => a.classList.toggle('is-active', a.getAttribute('href') === '#' + entry.target.id));
    });
  }, { rootMargin: '-45% 0px -50% 0px' });
  sections.forEach(s => secIO.observe(s));

  // Contact form -> FormSubmit (delivers to thapaliyalaya@gmail.com)
  const form = document.getElementById('contactForm');
  const status = document.getElementById('formStatus');
  const btn = document.getElementById('submitBtn');
  const label = btn.querySelector('.btn__label');

  const validate = () => {
    let ok = true;
    form.querySelectorAll('[required]').forEach(field => {
      const valid = field.checkValidity() && field.value.trim() !== '';
      field.closest('.field').classList.toggle('is-invalid', !valid);
      if (!valid) ok = false;
    });
    return ok;
  };
  form.addEventListener('input', e => {
    const f = e.target.closest('.field');
    if (f && f.classList.contains('is-invalid') && e.target.checkValidity()) f.classList.remove('is-invalid');
  });

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    status.className = 'form__status';
    if (!validate()) {
      status.textContent = 'Please fill in all required fields with valid details.';
      status.classList.add('err');
      return;
    }
    btn.classList.add('is-loading');
    label.textContent = 'Sending…';
    status.textContent = '';

    try {
      const data = Object.fromEntries(new FormData(form));
      data._replyto = data.email;
      const res = await fetch(form.action, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify(data)
      });
      const json = await res.json().catch(() => ({}));
      if (!res.ok || json.success === 'false' || json.success === false) throw new Error(json.message || 'Request failed');
      form.reset();
      status.textContent = 'Thank you! Your message has been sent. I will get back to you soon. 🌿';
      status.classList.add('ok');
    } catch (err) {
      status.innerHTML = 'Sorry, something went wrong. Please email me directly at <a href="mailto:thapaliyalaya@gmail.com"><u>thapaliyalaya@gmail.com</u></a>.';
      status.classList.add('err');
    } finally {
      btn.classList.remove('is-loading');
      label.textContent = 'Send message';
    }
  });
})();

/* ============ Birds: fly in, perch on the wires, fly away ============ */
(() => {
  const hero = document.querySelector('.hero');
  const bg = hero && hero.querySelector('.hero__bg');
  const wires = hero ? [...hero.querySelectorAll('.hero__contours path')] : [];
  if (!bg || !wires.length || matchMedia('(prefers-reduced-motion: reduce)').matches) return;

  const layer = document.createElement('div');
  layer.className = 'birds';
  bg.appendChild(layer);

  const FLY = '<svg class="bird__fly" viewBox="0 0 24 12"><g class="bird__wings"><path d="M12 6Q7 0 1 3"/><path d="M12 6Q17 0 23 3"/></g><ellipse cx="12" cy="6.4" rx="2" ry="1.3"/></svg>';
  const SIT = '<svg class="bird__sit" viewBox="0 0 16 14"><path d="M2.6 8.2 0 10.8 3.8 10z"/><ellipse cx="7" cy="8" rx="5" ry="3.5"/><circle cx="11.4" cy="4.8" r="2.4"/><path d="M13.5 4.3 15.8 5 13.5 5.7z"/><path class="bird__legs" d="M6 11v3M8.2 11v3"/></svg>';

  const rand = (a, b) => a + Math.random() * (b - a);
  const easeOut = p => 1 - Math.pow(1 - p, 3);
  const easeIn = p => p * p;
  const easeInOut = p => p < .5 ? 2 * p * p : 1 - Math.pow(-2 * p + 2, 2) / 2;
  const box = () => layer.getBoundingClientRect();
  const isMobile = () => innerWidth < 860;
  const perched = new Map(); // bird element -> spot on wire

  // Exact on-screen position of a point on a wire (handles the stretched SVG)
  function wirePoint(path, len) {
    const p = path.getPointAtLength(len), m = path.getScreenCTM(), r = box();
    return { x: p.x * m.a + p.y * m.c + m.e - r.left, y: p.x * m.b + p.y * m.d + m.f - r.top };
  }

  // Keep birds from landing behind the text, the photo or the menu
  function isBlocked(x, y) {
    const r = box();
    if (y < 90) return true;
    return [...hero.querySelectorAll('.hero__text > *, .hero__visual, .float-card, .scroll-cue')].some(el => {
      const b = el.getBoundingClientRect();
      return x > b.left - r.left - 16 && x < b.right - r.left + 16 && y > b.top - r.top - 16 && y < b.bottom - r.top + 16;
    });
  }

  function findPerch() {
    const r = box();
    for (let i = 0; i < 24; i++) {
      const path = wires[Math.floor(Math.random() * wires.length)];
      const len = path.getTotalLength() * rand(.03, .97);
      const pt = wirePoint(path, len);
      if (pt.x < 16 || pt.x > r.width - 16 || pt.y < 0 || pt.y > r.height - 10) continue;
      if (isBlocked(pt.x, pt.y)) continue;
      const crowded = [...perched.values()].some(s => {
        const q = wirePoint(s.path, s.len);
        return Math.hypot(q.x - pt.x, q.y - pt.y) < 24;
      });
      if (!crowded) return { path, len, ...pt };
    }
    return null;
  }

  function edgePoint(avoid) {
    const r = box();
    const sides = ['left', 'right', 'top', 'left', 'right'].filter(s => s !== avoid);
    const side = sides[Math.floor(Math.random() * sides.length)];
    if (side === 'left') return { side, x: -30, y: rand(.05, .65) * r.height };
    if (side === 'right') return { side, x: r.width + 30, y: rand(.05, .65) * r.height };
    return { side, x: rand(.1, .9) * r.width, y: -30 };
  }

  // Curved, slightly fluttering flight between two points
  function fly(bird, a, b, dur, ease, opts, done) {
    const { el, body } = bird;
    const dx = b.x - a.x, dy = b.y - a.y, dist = Math.hypot(dx, dy) || 1;
    const bend = (Math.random() < .5 ? -1 : 1) * dist * rand(.1, .28);
    const c = { x: (a.x + b.x) / 2 - dy / dist * bend, y: (a.y + b.y) / 2 + dx / dist * bend - dist * .08 };
    const wob = rand(2, 5), freq = rand(3, 6), t0 = performance.now();
    let lastX = a.x;
    (function step(now) {
      const p = Math.min((now - t0) / dur, 1), e = ease(p), u = 1 - e;
      const settle = opts.land ? 1 - p : 1;
      const x = u * u * a.x + 2 * u * e * c.x + e * e * b.x;
      const y = u * u * a.y + 2 * u * e * c.y + e * e * b.y + Math.sin(p * Math.PI * freq) * wob * settle;
      if (Math.abs(x - lastX) > .4) body.style.setProperty('--dir', x > lastX ? 1 : -1);
      lastX = x;
      el.style.transform = `translate3d(${x}px, ${y}px, 0)`;
      let o = .85;
      if (opts.fadeIn) o = Math.min(o, p / .1 * .85);
      if (opts.fadeOut && p > .4) o = .85 * (1 - (p - .4) / .6);
      el.style.opacity = o;
      if (opts.land) el.classList.toggle('is-gliding', p > .82);
      if (p < 1) requestAnimationFrame(step); else done();
    })(t0);
  }

  function spawn(origin) {
    const el = document.createElement('div');
    el.className = 'bird';
    el.innerHTML = `<div class="bird__body">${FLY}${SIT}</div>`;
    const body = el.firstChild;
    body.style.setProperty('--s', rand(.75, 1.2).toFixed(2));
    body.style.setProperty('--flap', rand(.16, .26).toFixed(2) + 's');
    layer.appendChild(el);
    const bird = { el, body };

    const start = origin ? { ...origin, x: origin.x + rand(-40, 40), y: origin.y + rand(-30, 30) } : edgePoint();
    const spot = Math.random() < .8 ? findPerch() : null;

    if (!spot) { // just passing through
      const end = edgePoint(start.side);
      fly(bird, start, end, rand(6000, 9000), easeInOut, { fadeIn: true }, () => el.remove());
      return;
    }

    perched.set(el, spot); // reserve the spot while approaching
    fly(bird, start, spot, rand(3200, 5200), easeOut, { land: true, fadeIn: true }, () => {
      const pt = wirePoint(spot.path, spot.len);
      el.style.transform = `translate3d(${pt.x}px, ${pt.y}px, 0)`;
      el.classList.remove('is-gliding');
      el.classList.add('is-perched');

      const stay = rand(3500, 8500);
      if (Math.random() < .5) setTimeout(() => {
        body.style.setProperty('--dir', -(+body.style.getPropertyValue('--dir') || 1));
      }, stay * rand(.3, .7));

      setTimeout(() => {
        const from = wirePoint(spot.path, spot.len);
        perched.delete(el);
        el.classList.remove('is-perched');
        const ang = rand(-160, -20) * Math.PI / 180, d = rand(500, 900);
        fly(bird, { x: from.x, y: from.y - 6 }, { x: from.x + Math.cos(ang) * d, y: from.y + Math.sin(ang) * d },
            rand(2600, 4000), easeIn, { fadeOut: true }, () => el.remove());
      }, stay);
    });
  }

  // Keep perched birds exactly on their wire when the window resizes
  addEventListener('resize', () => {
    perched.forEach((spot, el) => {
      if (!el.classList.contains('is-perched')) return;
      const pt = wirePoint(spot.path, spot.len);
      el.style.transform = `translate3d(${pt.x}px, ${pt.y}px, 0)`;
    });
  }, { passive: true });

  let heroVisible = true;
  new IntersectionObserver(([e]) => { heroVisible = e.isIntersecting; }).observe(hero);

  (function schedule() {
    const max = isMobile() ? 5 : 8;
    if (heroVisible && !document.hidden && layer.childElementCount < max) {
      if (Math.random() < .3) { // a small flock
        const origin = edgePoint(), n = 2 + Math.floor(Math.random() * 2);
        for (let i = 0; i < n; i++) setTimeout(() => spawn(origin), i * rand(150, 450));
      } else spawn();
    }
    setTimeout(schedule, rand(1800, 4200));
  })();
  setTimeout(spawn, 400);
})();
