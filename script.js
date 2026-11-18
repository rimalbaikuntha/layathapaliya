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

  // Real birds commonly seen on wires in Nepal
  const SPECIES = [
    { back: '#1f3f7f', wing: '#162f60', head: '#1f3f7f', throat: '#b8462b', belly: '#f4e8d6', tail: '#162f60', beak: '#2a2a2a', feet: '#3a2f2a', tailType: 'fork', beakType: 'short' },               // barn swallow
    { back: '#58a83a', wing: '#4a9431', head: '#a6b83a', throat: '#3fb0c4', belly: '#86c25a', tail: '#4a9431', beak: '#1d1d1d', feet: '#4a3a2a', tailType: 'long', beakType: 'long', stripe: true, pin: true }, // green bee-eater
    { back: '#1f93d6', wing: '#176fb4', head: '#7b3a1d', throat: '#ffffff', belly: '#7b3a1d', tail: '#1f93d6', beak: '#d8352a', feet: '#d8352a', tailType: 'short', beakType: 'long' },              // white-throated kingfisher
    { back: '#55483f', wing: '#463a32', head: '#1a1614', throat: '#1a1614', belly: '#ddd5c8', tail: '#2e2622', beak: '#151515', feet: '#2a2a2a', tailType: 'long', beakType: 'short', crest: true, vent: '#d42f2f' }, // red-vented bulbul
    { back: '#151515', wing: '#151515', head: '#151515', throat: '#151515', belly: '#f3f3f3', tail: '#151515', beak: '#151515', feet: '#333333', tailType: 'long', beakType: 'short', bar: '#ffffff' },  // oriental magpie-robin
    { back: '#8b5a33', wing: '#7a4c2a', head: '#8f8f8f', throat: '#262626', belly: '#dcd2c2', tail: '#6e4527', beak: '#3a3a3a', feet: '#8a6a50', tailType: 'short', beakType: 'short', bar: '#f4efe6' }   // house sparrow
  ];
  const TAIL_SIT = { short: 'M10 18.5 L2 22 L3.5 24 L11 21.5Z', long: 'M10 18.5 L0 26 L2.5 27.5 L11.5 21.5Z', fork: 'M10 18.5 L-1 25.5 L5 22.5 L-0.5 28.5 L11.5 21.5Z' };
  const TAIL_FLY = { short: 'M10 15 L2 13.5 L2 18.5 L10 17.5Z', long: 'M10 15 L-1 13.5 L-1 19 L10 17.5Z', fork: 'M10 15 L-3 11 L4 15.8 L-3 21 L10 17.5Z' };
  const BEAK_SIT = { short: 'M31.6 10 L35.6 11.3 L31.6 12.6Z', long: 'M31.4 9.9 L39 11.5 L31.4 12.9Z' };
  const BEAK_FLY = { short: 'M34.4 12.5 L37.6 13.6 L34.4 14.6Z', long: 'M34.2 12.4 L40.5 13.7 L34.2 14.9Z' };
  const WING = 'M19 14C18 7 13 1.5 5 -1C6.5 1 7.5 2.6 7 3C9 3.6 9.5 5.3 9 6C11 6.5 11.5 8.3 11 9C13 9.6 14 11.5 14 12.5C15.5 13.4 16.5 14.6 17.5 15.5Z';

  function sitSVG(s) {
    return `<svg class="bird__sit" viewBox="0 0 40 32">
      <g class="bird__tail"><path d="${TAIL_SIT[s.tailType]}" fill="${s.tail}"/>${s.pin ? `<path d="M2 26.5 L-5 30" stroke="${s.tail}" stroke-width=".8" stroke-linecap="round"/>` : ''}</g>
      <path d="M8 19C8 13 14 10 21 11C26 12 28.5 15 27.5 19C26.5 23 21.5 25.2 16 24.8C11 24.4 8 22.2 8 19Z" fill="${s.back}"/>
      <path d="M27.6 15.5C28.6 19.5 26 23.6 20 24.9C16 25.5 12.5 24.3 11 22.5C15 23 21 22 24 19.5C25.8 18 26.8 16.8 27.6 15.5Z" fill="${s.belly}"/>
      ${s.vent ? `<ellipse cx="12.5" cy="22.8" rx="2.3" ry="1.4" fill="${s.vent}"/>` : ''}
      <path d="M9 18.5C12 14 19 12.8 24.5 15.5C22 19.5 16 22 6.5 23Z" fill="${s.wing}"/>
      <path d="M11 20.5C15 19 19 17.5 22.5 16.5M9 21.8C13 21 17 19.5 21 18" stroke="rgba(0,0,0,.28)" stroke-width=".6" fill="none"/>
      ${s.bar ? `<path d="M13 17.6C16 16 19 15.5 22 15.9" stroke="${s.bar}" stroke-width="1.1" fill="none" stroke-linecap="round"/>` : ''}
      <path d="M12 15C16 11.5 22 11 25 13C20 12.8 15 14 12 16Z" fill="#fff" opacity=".22"/>
      <path d="M16.6 24.4 L16.9 27.6M19.8 24.2 L20 27.6M15.3 28C16 27.4 17.6 27.4 18.3 28M18.6 28C19.3 27.4 20.9 27.4 21.6 28" stroke="${s.feet}" stroke-width="1" stroke-linecap="round" fill="none"/>
      ${s.crest ? `<path d="M23 8.5 L24.8 3.2 L28 6.8Z" fill="${s.head}"/>` : ''}
      <circle cx="27" cy="11" r="5.2" fill="${s.head}"/>
      <path d="M23.5 13.2C25 17.6 30.2 17.4 32 13C30.5 14.6 26.5 15.6 23.5 13.2Z" fill="${s.throat}"/>
      ${s.stripe ? '<path d="M23.5 9.4 L33.5 10.4 L33.5 12 L23.5 11.6Z" fill="#111"/>' : ''}
      <circle cx="28.8" cy="10.2" r="1.2" fill="#0d0d0d"/><circle cx="29.2" cy="9.7" r=".42" fill="#fff"/>
      <path d="${BEAK_SIT[s.beakType]}" fill="${s.beak}"/>
    </svg>`;
  }

  function flySVG(s) {
    const wing = (cls, dark) => `<g class="${cls}"><path d="${WING}" fill="${s.wing}"/>
      <path d="M19 14C18.2 9 15 5 10 2.5C14 6 16.5 10 17.6 15Z" fill="${s.back}" opacity=".9"/>
      ${s.bar ? `<path d="M17.5 12C16 9 13.5 6.5 10.5 4.8" stroke="${s.bar}" stroke-width="1.1" fill="none" stroke-linecap="round"/>` : ''}
      <path d="M15 12.5C12 10 9 7 7 3M12.5 13.3C10 11 8 8.5 6.5 5.5" stroke="rgba(0,0,0,.25)" stroke-width=".5" fill="none"/>
      ${dark ? `<path d="${WING}" fill="#000" opacity=".3"/>` : ''}</g>`;
    return `<svg class="bird__fly" viewBox="0 0 44 30">
      <g transform="translate(1.5 -0.5)">${wing('w-far', true)}</g>
      <path d="${TAIL_FLY[s.tailType]}" fill="${s.tail}"/>${s.pin ? `<path d="M-1 16.2 L-6 16.2" stroke="${s.tail}" stroke-width=".8" stroke-linecap="round"/>` : ''}
      <path d="M9 16C12 12 20 11.5 27 12.5C31 13.2 32.5 16 29.5 17.8C24.5 20 15 20 9 16Z" fill="${s.back}"/>
      <path d="M29.8 15.6C30.6 17.4 27.5 19.4 22 19.6C17 19.8 12.5 18.5 10.5 17C15 18 22 18 26 17C28 16.5 29.2 16 29.8 15.6Z" fill="${s.belly}"/>
      ${s.vent ? `<ellipse cx="12.5" cy="17.6" rx="2" ry="1" fill="${s.vent}"/>` : ''}
      <path d="M17 18.8 L13.5 19.8" stroke="${s.feet}" stroke-width=".9" stroke-linecap="round"/>
      ${s.crest ? `<path d="M29 10.5 L30.2 7.4 L32.6 10Z" fill="${s.head}"/>` : ''}
      <circle cx="31.5" cy="13.6" r="3.7" fill="${s.head}"/>
      <path d="M29.5 15.8C31 17.6 34 17 35 14.8C33.8 16.2 31.6 16.6 29.5 15.8Z" fill="${s.throat}"/>
      ${s.stripe ? '<path d="M29 13 L35.5 13.3 L35.5 14.2 L29 14.2Z" fill="#111"/>' : ''}
      <circle cx="33" cy="12.9" r=".85" fill="#0d0d0d"/><circle cx="33.3" cy="12.6" r=".3" fill="#fff"/>
      <path d="${BEAK_FLY[s.beakType]}" fill="${s.beak}"/>
      ${wing('w-near', false)}
    </svg>`;
  }

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
      let o = 1;
      if (opts.fadeIn) o = Math.min(o, p / .1);
      if (opts.fadeOut && p > .4) o = 1 - (p - .4) / .6;
      el.style.opacity = o;
      if (opts.land) el.classList.toggle('is-gliding', p > .82);
      if (p < 1) requestAnimationFrame(step); else done();
    })(t0);
  }

  function spawn(origin, species) {
    const sp = species || SPECIES[Math.floor(Math.random() * SPECIES.length)];
    const el = document.createElement('div');
    el.className = 'bird';
    el.innerHTML = `<div class="bird__body">${flySVG(sp)}${sitSVG(sp)}</div>`;
    const body = el.firstChild;
    body.style.setProperty('--s', rand(.85, 1.1).toFixed(2));
    body.style.setProperty('--flap', rand(.15, .22).toFixed(2) + 's');
    body.style.setProperty('--flick', rand(-4, 0).toFixed(2) + 's');
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
    fly(bird, start, { x: spot.x, y: spot.y - 10 }, rand(3200, 5200), easeOut, { land: true, fadeIn: true }, () => {
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
        fly(bird, { x: from.x, y: from.y - 10 }, { x: from.x + Math.cos(ang) * d, y: from.y + Math.sin(ang) * d },
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
        const sp = SPECIES[Math.floor(Math.random() * SPECIES.length)];
        for (let i = 0; i < n; i++) setTimeout(() => spawn(origin, sp), i * rand(150, 450));
      } else spawn();
    }
    setTimeout(schedule, rand(1800, 4200));
  })();
  setTimeout(spawn, 400);
})();
