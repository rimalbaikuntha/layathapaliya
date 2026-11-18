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

/* ============ Birds: perch on the wires, live a little, chase insects ============ */
(() => {
  const hero = document.querySelector('.hero');
  const wires = hero ? [...hero.querySelectorAll('.hero__contours path')] : [];
  if (!hero || !wires.length || matchMedia('(prefers-reduced-motion: reduce)').matches) return;

  const layer = document.createElement('div');
  layer.className = 'birds';
  layer.setAttribute('aria-hidden', 'true');
  hero.appendChild(layer);

  // Real birds commonly seen on wires in Nepal
  const SPECIES = [
    { back: '#1f3f7f', wing: '#162f60', head: '#1f3f7f', throat: '#b8462b', belly: '#e6c49a', tail: '#162f60', beak: '#2a2a2a', feet: '#3a2f2a', tailType: 'fork', beakType: 'short' },               // barn swallow
    { back: '#58a83a', wing: '#4a9431', head: '#a6b83a', throat: '#3fb0c4', belly: '#86c25a', tail: '#4a9431', beak: '#1d1d1d', feet: '#4a3a2a', tailType: 'long', beakType: 'long', stripe: true, pin: true }, // green bee-eater
    { back: '#1f93d6', wing: '#176fb4', head: '#7b3a1d', throat: '#ffffff', belly: '#7b3a1d', tail: '#1f93d6', beak: '#d8352a', feet: '#d8352a', tailType: 'short', beakType: 'long' },              // white-throated kingfisher
    { back: '#55483f', wing: '#463a32', head: '#1a1614', throat: '#1a1614', belly: '#cbbfa9', tail: '#2e2622', beak: '#151515', feet: '#2a2a2a', tailType: 'long', beakType: 'short', crest: true, vent: '#d42f2f' }, // red-vented bulbul
    { back: '#151515', wing: '#151515', head: '#151515', throat: '#151515', belly: '#e4e4df', tail: '#151515', beak: '#151515', feet: '#333333', tailType: 'long', beakType: 'short', bar: '#ffffff' },  // oriental magpie-robin
    { back: '#8b5a33', wing: '#7a4c2a', head: '#8f8f8f', throat: '#262626', belly: '#cdb999', tail: '#6e4527', beak: '#3a3a3a', feet: '#8a6a50', tailType: 'short', beakType: 'short', bar: '#f4efe6' }   // house sparrow
  ];
  const TAIL_SIT = { short: 'M10 18.5 L2 22 L3.5 24 L11 21.5Z', long: 'M10 18.5 L0 26 L2.5 27.5 L11.5 21.5Z', fork: 'M10 18.5 L-1 25.5 L5 22.5 L-0.5 28.5 L11.5 21.5Z' };
  const TAIL_FLY = { short: 'M21 18.5 L9 15.5 L8 24.5 L21 21.5Z', long: 'M21 18.5 L4 16.5 L4 23.5 L21 21.5Z', fork: 'M21 18.5 L2 12.5 L12 20 L2 27.5 L21 21.5Z' };
  const BEAK_SIT = { short: 'M31.6 10 L35.6 11.3 L31.6 12.6Z', long: 'M31.4 9.9 L39 11.5 L31.4 12.9Z' };
  const BEAK_FLY = { short: 'M50 17.4 L54.4 18.9 L50 20.3Z', long: 'M49.8 17.2 L58 19 L49.8 20.7Z' };
  // Long, broad wing with separated primary feathers ("fingers") along the trailing edge
  const WING = 'M37 18.5C35 11 26 4 12 0.2L17.5 3L15.4 4.3L20.2 5.9L18.2 7.4L22.4 8.8L20.7 10.4L24.3 11.6L23 13.3L25.8 14.7C24.6 16.4 23.6 18.4 23 20.5Z';

  function sitSVG(s) {
    return `<svg class="bird__sit" viewBox="0 0 40 32">
      <g class="bird__tail"><path d="${TAIL_SIT[s.tailType]}" fill="${s.tail}"/>${s.pin ? `<path d="M2 26.5 L-5 30" stroke="${s.tail}" stroke-width=".8" stroke-linecap="round"/>` : ''}</g>
      <path d="M8 19C8 13 14 10 21 11C26 12 28.5 15 27.5 19C26.5 23 21.5 25.2 16 24.8C11 24.4 8 22.2 8 19Z" fill="${s.back}"/>
      <path d="M27.6 15.5C28.6 19.5 26 23.6 20 24.9C16 25.5 12.5 24.3 11 22.5C15 23 21 22 24 19.5C25.8 18 26.8 16.8 27.6 15.5Z" fill="${s.belly}"/>
      ${s.vent ? `<ellipse cx="12.5" cy="22.8" rx="2.3" ry="1.4" fill="${s.vent}"/>` : ''}
      <path d="M12 15C16 11.5 22 11 25 13C20 12.8 15 14 12 16Z" fill="#fff" opacity=".22"/>
      <g class="bird__wing">
        <path d="M9 18.5C12 14 19 12.8 24.5 15.5C22 19.5 16 22 6.5 23Z" fill="${s.wing}"/>
        <path d="M11 20.5C15 19 19 17.5 22.5 16.5M9 21.8C13 21 17 19.5 21 18" stroke="rgba(0,0,0,.28)" stroke-width=".6" fill="none"/>
        ${s.bar ? `<path d="M13 17.6C16 16 19 15.5 22 15.9" stroke="${s.bar}" stroke-width="1.1" fill="none" stroke-linecap="round"/>` : ''}
      </g>
      <path d="M16.6 24.4 L16.9 27.6M19.8 24.2 L20 27.6M15.3 28C16 27.4 17.6 27.4 18.3 28M18.6 28C19.3 27.4 20.9 27.4 21.6 28" stroke="${s.feet}" stroke-width="1" stroke-linecap="round" fill="none"/>
      <g class="bird__head">
        ${s.crest ? `<path d="M23 8.5 L24.8 3.2 L28 6.8Z" fill="${s.head}"/>` : ''}
        <circle cx="27" cy="11" r="5.2" fill="${s.head}"/>
        <path d="M23.5 13.2C25 17.6 30.2 17.4 32 13C30.5 14.6 26.5 15.6 23.5 13.2Z" fill="${s.throat}"/>
        ${s.stripe ? '<path d="M23.5 9.4 L33.5 10.4 L33.5 12 L23.5 11.6Z" fill="#111"/>' : ''}
        <circle cx="28.8" cy="10.2" r="1.2" fill="#0d0d0d"/><circle cx="29.2" cy="9.7" r=".42" fill="#fff"/>
        <path d="${BEAK_SIT[s.beakType]}" fill="${s.beak}"/>
      </g>
    </svg>`;
  }

  function flySVG(s) {
    const wing = (cls, dark) => `<g class="${cls}"><path d="${WING}" fill="${s.wing}"/>
      <path d="M37 18.5C35.5 12.5 29 7 21 3.5C27 8 31 12.5 32.5 19Z" fill="${s.back}" opacity=".9"/>
      ${s.bar ? `<path d="M33 15.5C30.5 11.5 27 8.5 22.5 6" stroke="${s.bar}" stroke-width="1.3" fill="none" stroke-linecap="round"/>` : ''}
      <path d="M30 17C26 12 21 7 15.5 2.5M28.5 18C25.5 14 22.5 10.5 19.5 7M27 19C25.5 16.5 24.3 14.8 23 12.6" stroke="rgba(0,0,0,.22)" stroke-width=".55" fill="none"/>
      <path d="M36 16.5C34 11 28 6 19 2.4" stroke="rgba(255,255,255,.28)" stroke-width=".8" fill="none"/>
      ${dark ? `<path d="${WING}" fill="#000" opacity=".32"/>` : ''}</g>`;
    return `<svg class="bird__fly" viewBox="0 0 64 40">
      <g transform="translate(3 -1.5)">${wing('w-far', true)}</g>
      <path d="${TAIL_FLY[s.tailType]}" fill="${s.tail}"/>${s.pin ? `<path d="M4 20 L-3 20" stroke="${s.tail}" stroke-width="1" stroke-linecap="round"/>` : ''}
      <path d="M17 20C21 14.5 31 13.5 40 14.6C45.5 15.3 48 18.5 46 22C42 26.5 28 27 17 20Z" fill="${s.back}" stroke="rgba(0,0,0,.3)" stroke-width=".6"/>
      <path d="M46.2 21.2C44.6 25 38.5 26.9 30.5 26.7C24.5 26.5 20 24.2 17.8 21.4C24 23.9 33 24.4 40 23.4C43 23 44.9 22.2 46.2 21.2Z" fill="${s.belly}"/>
      <path d="M18 21.6C26 27 40 27.2 46.1 21.8" stroke="rgba(0,0,0,.32)" stroke-width=".7" fill="none"/>
      <path d="M21.5 18.2C27 15 35 14.2 41 15.2C35 15.5 28 16.8 21.5 19.4Z" fill="#fff" opacity=".22"/>
      ${s.vent ? `<ellipse cx="22.5" cy="23.3" rx="2.8" ry="1.4" fill="${s.vent}"/>` : ''}
      ${s.crest ? `<path d="M41.5 14.6 L43 10.2 L46.6 13.6Z" fill="${s.head}"/>` : ''}
      <circle cx="45.5" cy="18.5" r="5" fill="${s.head}" stroke="rgba(0,0,0,.3)" stroke-width=".6"/>
      <path d="M42.5 21.2C44.6 23.8 48.8 23 50 19.8C48.4 21.8 45.2 22.3 42.5 21.2Z" fill="${s.throat}"/>
      ${s.stripe ? '<path d="M41.6 17.4 L50.5 17.8 L50.5 19.2 L41.6 19.1Z" fill="#111"/>' : ''}
      <circle cx="47.3" cy="17.4" r="1.1" fill="#0d0d0d"/><circle cx="47.7" cy="17" r=".38" fill="#fff"/>
      <path d="${BEAK_FLY[s.beakType]}" fill="${s.beak}"/>
      ${wing('w-near', false)}
    </svg>`;
  }

  /* ---------- helpers ---------- */
  const rand = (a, b) => a + Math.random() * (b - a);
  const pick = arr => arr[Math.floor(Math.random() * arr.length)];
  const easeOut = p => 1 - Math.pow(1 - p, 3);
  const easeIn = p => p * p;
  const easeInOut = p => p < .5 ? 2 * p * p : 1 - Math.pow(-2 * p + 2, 2) / 2;
  const box = () => layer.getBoundingClientRect();
  const isMobile = () => innerWidth < 860;
  const birds = new Set();
  const insects = [];
  let heroVisible = true;

  // Exact on-screen position of a point on a wire (handles the stretched SVG)
  function wirePoint(path, len) {
    const p = path.getPointAtLength(len), m = path.getScreenCTM(), r = box();
    return { x: p.x * m.a + p.y * m.c + m.e - r.left, y: p.x * m.b + p.y * m.d + m.f - r.top };
  }

  // Keep birds off the text, the photo and the menu
  function isBlocked(x, y) {
    const r = box();
    if (y < 90) return true;
    return [...hero.querySelectorAll('.hero__text > *, .hero__visual, .float-card, .scroll-cue')].some(el => {
      const b = el.getBoundingClientRect();
      return x > b.left - r.left - 16 && x < b.right - r.left + 16 && y > b.top - r.top - 16 && y < b.bottom - r.top + 16;
    });
  }

  function isCrowded(pt, self) {
    for (const b of birds) {
      if (b === self || !b.spot) continue;
      const q = wirePoint(b.spot.path, b.spot.len);
      if (Math.hypot(q.x - pt.x, q.y - pt.y) < 26) return true;
    }
    return false;
  }

  function validSpot(path, len, self) {
    const r = box(), pt = wirePoint(path, len);
    if (pt.x < 16 || pt.x > r.width - 16 || pt.y < 0 || pt.y > r.height - 10) return null;
    if (isBlocked(pt.x, pt.y) || isCrowded(pt, self)) return null;
    return { path, len, ...pt };
  }

  // Random free spot; optionally near a point (for hopping between wires)
  function findPerch(self, near) {
    for (let i = 0; i < 40; i++) {
      const path = pick(wires);
      const spot = validSpot(path, path.getTotalLength() * rand(.03, .97), self);
      if (!spot) continue;
      if (near) {
        const d = Math.hypot(spot.x - near.x, spot.y - near.y);
        if (d < 30 || d > 170 || (path === near.path && Math.random() < .6)) continue;
      }
      return spot;
    }
    return null;
  }

  function edgePoint(avoid) {
    const r = box();
    const side = pick(['left', 'right', 'top', 'left', 'right'].filter(s => s !== avoid));
    if (side === 'left') return { side, x: -30, y: rand(.05, .65) * r.height };
    if (side === 'right') return { side, x: r.width + 30, y: rand(.05, .65) * r.height };
    return { side, x: rand(.1, .9) * r.width, y: -30 };
  }

  const getDir = b => +b.body.style.getPropertyValue('--dir') || 1;
  const setDir = (b, d) => b.body.style.setProperty('--dir', d);
  const place = (b, x, y) => { b.el.style.transform = `translate3d(${x}px, ${y}px, 0)`; };

  /* ---------- flight ---------- */
  // Curved, slightly fluttering flight. `to` may be a function (moving target, e.g. an insect).
  function fly(bird, a, to, dur, ease, opts, done) {
    const target = typeof to === 'function' ? to : () => to;
    const b0 = target();
    const dx = b0.x - a.x, dy = b0.y - a.y, dist = Math.hypot(dx, dy) || 1;
    const bend = (Math.random() < .5 ? -1 : 1) * dist * (opts.bend ?? rand(.1, .28));
    const lift = opts.lift ?? .08;
    const off = { x: -dy / dist * bend, y: dx / dist * bend - dist * lift };
    const wob = opts.steady ? 0 : rand(2, 5), freq = rand(3, 6), t0 = performance.now();
    let lastX = a.x;
    bird.el.classList.remove('is-perched');
    (function step(now) {
      if (!bird.el.isConnected) return;
      const b = target();
      const c = { x: (a.x + b.x) / 2 + off.x, y: (a.y + b.y) / 2 + off.y };
      const p = Math.min((now - t0) / dur, 1), e = ease(p), u = 1 - e;
      const settle = opts.land ? 1 - p : 1;
      const x = u * u * a.x + 2 * u * e * c.x + e * e * b.x;
      const y = u * u * a.y + 2 * u * e * c.y + e * e * b.y + Math.sin(p * Math.PI * freq) * wob * settle;
      if (Math.abs(x - lastX) > .4) setDir(bird, x > lastX ? 1 : -1);
      lastX = x;
      place(bird, x, y);
      let o = 1;
      if (opts.fadeIn) o = Math.min(o, p / .1);
      if (opts.fadeOut && p > .4) o = 1 - (p - .4) / .6;
      bird.el.style.opacity = o;
      if (opts.land) bird.el.classList.toggle('is-gliding', p > .8);
      if (p < 1) requestAnimationFrame(step); else done && done();
    })(t0);
  }

  function land(bird, spot) {
    bird.spot = spot;
    const pt = wirePoint(spot.path, spot.len);
    place(bird, pt.x, pt.y);
    bird.el.classList.remove('is-gliding');
    bird.el.classList.add('is-perched');
    bird.state = 'perched';
    if (bird.scared) return leave(bird);
    schedule(bird);
  }

  function leave(bird, startled) {
    clearTimeout(bird.timer);
    bird.state = 'leaving';
    const from = bird.spot ? wirePoint(bird.spot.path, bird.spot.len) : null;
    bird.spot = null;
    if (!from) return;
    const ang = rand(-160, -20) * Math.PI / 180, d = rand(550, 950);
    fly(bird, { x: from.x, y: from.y - 10 }, { x: from.x + Math.cos(ang) * d, y: from.y + Math.sin(ang) * d },
      startled ? rand(1700, 2400) : rand(2600, 3800), easeIn, { fadeOut: true }, () => remove(bird));
  }

  function remove(bird) {
    clearTimeout(bird.timer);
    birds.delete(bird);
    bird.el.remove();
  }

  /* ---------- life on the wire ---------- */
  function schedule(bird, delay) {
    clearTimeout(bird.timer);
    bird.timer = setTimeout(() => act(bird), delay ?? rand(1600, 3800));
  }

  function play(bird, cls, ms) {
    bird.el.classList.add(cls);
    setTimeout(() => { bird.el.classList.remove(cls); if (bird.state === 'perched') schedule(bird); }, ms);
  }

  function act(bird) {
    if (bird.state !== 'perched') return;
    if (performance.now() > bird.leaveAt) return leave(bird);
    if (!heroVisible || document.hidden) return schedule(bird, 2000);

    const prey = nearestInsect(bird, 450);
    if (prey) return sally(bird, prey);

    const roll = Math.random() * 15;
    if (roll < 3) return shuffle(bird);
    if (roll < 5) return hop(bird);
    if (roll < 7) return play(bird, 'is-stretch', 1300);   // wing stretch / flutter
    if (roll < 9) return play(bird, 'is-preen', 1500);     // preen chest feathers
    if (roll < 11) { setDir(bird, -getDir(bird)); return schedule(bird); } // look the other way
    if (roll < 12) return poop(bird);
    schedule(bird); // just sit and enjoy the view
  }

  // Sidestep a little along the same wire
  function shuffle(bird) {
    const { path } = bird.spot;
    const total = path.getTotalLength();
    const p0 = wirePoint(path, bird.spot.len), p1 = wirePoint(path, Math.min(total, bird.spot.len + 10));
    const unitsPerPx = 10 / (Math.hypot(p1.x - p0.x, p1.y - p0.y) || 1);
    const dir = Math.random() < .5 ? -1 : 1;
    const steps = 2 + Math.floor(Math.random() * 3);
    const endLen = bird.spot.len + dir * steps * rand(6, 9) * unitsPerPx;
    if (endLen < 0 || endLen > total || !validSpot(path, endLen, bird)) return schedule(bird);
    setDir(bird, dir);
    const startLen = bird.spot.len, dur = steps * 190, t0 = performance.now();
    bird.state = 'busy';
    (function step(now) {
      if (!bird.el.isConnected) return;
      const p = Math.min((now - t0) / dur, 1);
      const len = startLen + (endLen - startLen) * p;
      const pt = wirePoint(path, len);
      place(bird, pt.x, pt.y - Math.abs(Math.sin(p * Math.PI * steps)) * 3);
      bird.spot.len = len;
      if (p < 1) return requestAnimationFrame(step);
      bird.state = 'perched';
      if (bird.scared) return leave(bird, true);
      schedule(bird);
    })(t0);
  }

  // Jump across to a nearby wire
  function hop(bird) {
    const from = wirePoint(bird.spot.path, bird.spot.len);
    const spot = findPerch(bird, { ...from, path: bird.spot.path });
    if (!spot) return schedule(bird);
    bird.state = 'busy';
    bird.spot = spot; // reserve the new spot
    fly(bird, { x: from.x, y: from.y - 10 }, { x: spot.x, y: spot.y - 10 }, rand(650, 950), easeInOut,
      { land: true, bend: rand(.05, .15), lift: .35, steady: true }, () => land(bird, spot));
  }

  // Lift the tail and drop a little something
  function poop(bird) {
    bird.el.classList.add('is-poop');
    setTimeout(() => {
      const pt = wirePoint(bird.spot.path, bird.spot.len);
      const s = +bird.body.style.getPropertyValue('--s') || 1;
      const drop = document.createElement('span');
      drop.className = 'poop';
      drop.style.left = `${pt.x - 10 * getDir(bird) * s}px`;
      drop.style.top = `${pt.y - 3}px`;
      drop.style.setProperty('--fall', `${rand(90, 160)}px`);
      layer.appendChild(drop);
      drop.addEventListener('animationend', () => drop.remove());
    }, 350);
    play(bird, 'is-poop', 800);
  }

  /* ---------- insects: appear now and then, near a perched bird ---------- */
  function addInsect(near) {
    const r = box();
    for (let i = 0; i < 25; i++) {
      const x = near.x + rand(-170, 170), y = near.y - rand(35, 120);
      if (x < 30 || x > r.width - 30 || y < 100 || y > r.height - 20 || isBlocked(x, y)) continue;
      const el = document.createElement('span');
      el.className = 'insect';
      layer.appendChild(el);
      const ins = { el, x, y, hx: x, hy: y, vx: 0, vy: 0, hunted: false };
      insects.push(ins);
      // if nobody catches it, it flies off after a while
      setTimeout(() => { if (!ins.hunted) vanish(ins); }, rand(5000, 8000));
      return ins;
    }
    return null;
  }

  function vanish(ins) {
    const idx = insects.indexOf(ins);
    if (idx > -1) insects.splice(idx, 1);
    ins.el.classList.add('is-eaten');
    setTimeout(() => ins.el.remove(), 250);
  }

  // The closest bird on the wire spots the insect and goes for it right away
  function react(ins) {
    let best = null, bestD = 450;
    birds.forEach(b => {
      if (b.state !== 'perched' || !b.spot) return;
      const pt = wirePoint(b.spot.path, b.spot.len);
      const d = Math.hypot(ins.x - pt.x, ins.y - pt.y);
      if (d < bestD) { best = b; bestD = d; }
    });
    if (!best) return;
    const hunter = best;
    hunter.state = 'busy'; // claim it so no other action starts
    clearTimeout(hunter.timer);
    setTimeout(() => {
      if (!hunter.el.isConnected || !insects.includes(ins) || ins.hunted) { hunter.state = 'perched'; return schedule(hunter); }
      hunter.state = 'perched';
      sally(hunter, ins);
    }, rand(250, 650));
  }

  (function insectWaves() {
    const sitters = [...birds].filter(b => b.state === 'perched' && b.spot);
    if (heroVisible && !document.hidden && sitters.length) {
      const sitter = pick(sitters);
      const near = wirePoint(sitter.spot.path, sitter.spot.len);
      const n = Math.random() < .35 ? 2 : 1;
      for (let i = 0; i < n; i++) setTimeout(() => { const ins = addInsect(near); if (ins) react(ins); }, i * rand(500, 1200));
    }
    setTimeout(insectWaves, rand(8000, 15000));
  })();

  function nearestInsect(bird, maxDist) {
    const pt = wirePoint(bird.spot.path, bird.spot.len);
    let best = null, bestD = maxDist;
    insects.forEach(i => {
      if (i.hunted) return;
      const d = Math.hypot(i.x - pt.x, i.y - pt.y);
      if (d < bestD) { best = i; bestD = d; }
    });
    return best;
  }

  // Dart out, snap the insect mid-air, and return to a perch
  function sally(bird, prey) {
    const home = bird.spot;
    const from = wirePoint(home.path, home.len);
    prey.hunted = true;
    bird.state = 'busy';
    fly(bird, { x: from.x, y: from.y - 10 }, () => ({ x: prey.x, y: prey.y }), rand(700, 1000), easeInOut,
      { bend: rand(.05, .2), lift: .1, steady: true }, () => {
        eat(prey);
        bird.el.classList.add('is-coasting');
        setTimeout(() => bird.el.classList.remove('is-coasting'), 300);
        if (bird.scared) { bird.spot = home; return leave(bird, true); }
        const back = validSpot(home.path, home.len, bird) || findPerch(bird, { x: prey.x, y: prey.y, path: null });
        if (!back) { bird.spot = home; return leave(bird); }
        bird.spot = back;
        const here = { x: prey.x, y: prey.y };
        fly(bird, here, { x: back.x, y: back.y - 10 }, rand(800, 1100), easeOut, { land: true, bend: rand(.1, .2), steady: true }, () => land(bird, back));
      });
  }

  function eat(prey) {
    const idx = insects.indexOf(prey);
    if (idx > -1) insects.splice(idx, 1);
    prey.el.classList.add('is-eaten');
    setTimeout(() => prey.el.remove(), 250);
  }

  // Gnat-like wandering around a slowly drifting home point
  let lastT = performance.now();
  function insectLoop(now) {
    const dt = Math.min((now - lastT) / 16.7, 3);
    lastT = now;
    if (heroVisible && !document.hidden) {
      insects.forEach(i => {
        if (!i.hunted) { i.hx += rand(-.4, .4) * dt; i.hy += rand(-.3, .3) * dt; }
        i.vx += (rand(-.55, .55) - (i.x - i.hx) * .004) * dt;
        i.vy += (rand(-.55, .55) - (i.y - i.hy) * .004) * dt;
        i.vx *= .93; i.vy *= .93;
        const sp = Math.hypot(i.vx, i.vy), max = i.hunted ? 3 : 1.8;
        if (sp > max) { i.vx *= max / sp; i.vy *= max / sp; }
        i.x += i.vx * dt; i.y += i.vy * dt;
        i.el.style.transform = `translate3d(${i.x}px, ${i.y}px, 0)`;
      });
    }
    requestAnimationFrame(insectLoop);
  }

  /* ---------- arrivals ---------- */
  function spawn(origin, species) {
    const sp = species || pick(SPECIES);
    const el = document.createElement('div');
    el.className = 'bird';
    el.innerHTML = `<div class="bird__body">${flySVG(sp)}${sitSVG(sp)}<span class="bird__hit" title="Shoo!"></span></div>`;
    const body = el.firstChild;
    body.style.setProperty('--s', rand(.85, 1.1).toFixed(2));
    body.style.setProperty('--flap', rand(.26, .34).toFixed(2) + 's');
    body.style.setProperty('--flick', rand(-4, 0).toFixed(2) + 's');
    layer.appendChild(el);
    const bird = { el, body, spot: null, state: 'arriving', timer: 0, scared: false, leaveAt: performance.now() + rand(90000, 180000) };
    birds.add(bird);

    // flap-flap-glide rhythm while in the air
    const coast = setInterval(() => {
      if (!el.isConnected) return clearInterval(coast);
      if (bird.state === 'perched' || Math.random() < .45) return;
      el.classList.add('is-coasting');
      setTimeout(() => el.classList.remove('is-coasting'), rand(450, 1000));
    }, rand(1300, 2100));

    // click / tap a bird to send it flying
    body.querySelector('.bird__hit').addEventListener('click', e => {
      e.stopPropagation();
      if (bird.state === 'perched') leave(bird, true); else bird.scared = true;
    });

    const start = origin ? { ...origin, x: origin.x + rand(-40, 40), y: origin.y + rand(-30, 30) } : edgePoint();
    const spot = Math.random() < .9 ? findPerch(bird) : null;
    if (!spot) { // just passing through
      bird.state = 'passing';
      fly(bird, start, edgePoint(start.side), rand(6000, 9000), easeInOut, { fadeIn: true }, () => remove(bird));
      return;
    }
    bird.spot = spot; // reserve while approaching
    fly(bird, start, { x: spot.x, y: spot.y - 10 }, rand(3200, 5200), easeOut, { land: true, fadeIn: true }, () => land(bird, spot));
  }

  // Keep perched birds exactly on their wire when the window resizes
  addEventListener('resize', () => {
    birds.forEach(b => {
      if (b.state !== 'perched' || !b.spot) return;
      const pt = wirePoint(b.spot.path, b.spot.len);
      place(b, pt.x, pt.y);
    });
  }, { passive: true });

  new IntersectionObserver(([e]) => { heroVisible = e.isIntersecting; }).observe(hero);

  (function arrivals() {
    const max = isMobile() ? 3 : 4;
    if (heroVisible && !document.hidden && birds.size < max) {
      if (Math.random() < .15 && birds.size <= max - 2) {
        const origin = edgePoint(), sp = pick(SPECIES);
        spawn(origin, sp);
        setTimeout(() => spawn(origin, sp), rand(200, 500));
      } else spawn();
    }
    setTimeout(arrivals, rand(5000, 10000));
  })();
  setTimeout(spawn, 400);
  setTimeout(spawn, 2600);

  requestAnimationFrame(insectLoop);
})();
