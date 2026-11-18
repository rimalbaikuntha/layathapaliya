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
