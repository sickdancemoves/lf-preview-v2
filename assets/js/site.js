// Scale the MacBook photo stage (fixed 1200×800 with matrix3d) to fit its responsive wrapper
(function () {
  const wraps = document.querySelectorAll('.laptop-photo');
  if (!wraps.length) return;
  function sync(wrap) {
    const stage = wrap.querySelector('.laptop-photo__stage');
    if (!stage) return;
    const scale = wrap.offsetWidth / 1200;
    stage.style.transform = 'scale(' + scale + ')';
  }
  const ro = new ResizeObserver(entries => entries.forEach(e => sync(e.target)));
  wraps.forEach(w => { sync(w); ro.observe(w); });
})();

// Mobile drawer — hamburger toggles a full-screen overlay nav. Inspired by
// the Stripe/Stone mobile pattern: hamburger top-right, full-bleed dark
// overlay slides in from above with large hit-area links + CTAs.
(function () {
  const btn = document.getElementById('headerHamburger');
  const drawer = document.getElementById('mobileDrawer');
  if (!btn || !drawer) return;

  function open() {
    drawer.classList.add('is-open');
    drawer.setAttribute('aria-hidden', 'false');
    btn.setAttribute('aria-expanded', 'true');
    document.body.style.overflow = 'hidden';
  }
  function close() {
    drawer.classList.remove('is-open');
    drawer.setAttribute('aria-hidden', 'true');
    btn.setAttribute('aria-expanded', 'false');
    document.body.style.overflow = '';
  }
  function toggle() {
    if (drawer.classList.contains('is-open')) close(); else open();
  }

  btn.addEventListener('click', toggle);
  // Close when a nav link is clicked (drawer dismisses before navigation)
  drawer.querySelectorAll('.mobile-drawer__link, .mobile-drawer__btn').forEach(el => {
    el.addEventListener('click', () => setTimeout(close, 0));
  });
  // Lang buttons inside drawer mirror the header lang switch
  drawer.querySelectorAll('.mobile-drawer__lang-btn').forEach(el => {
    el.addEventListener('click', () => {
      const lang = el.getAttribute('data-lang-set');
      const main = document.querySelector('.lang-switch__option[data-lang-set="' + lang + '"]');
      if (main) main.click();
      close();
    });
  });
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape' && drawer.classList.contains('is-open')) close();
  });
  // If viewport grows past mobile while drawer is open, close it
  window.addEventListener('resize', () => {
    if (window.innerWidth > 900 && drawer.classList.contains('is-open')) close();
  });
})();

// Header dropdown menus — JS-driven open/close (hover + click + ESC + click-outside)
(function () {
  const items = document.querySelectorAll('.header__menu-item.has-submenu');
  if (items.length === 0) return;
  const CLOSE_DELAY = 120;

  function closeAll(except) {
    items.forEach(i => { if (i !== except) i.classList.remove('is-open'); });
  }

  items.forEach(item => {
    const trigger = item.querySelector(':scope > a');
    let timer = null;
    function open() { clearTimeout(timer); closeAll(item); item.classList.add('is-open'); }
    function close() { clearTimeout(timer); item.classList.remove('is-open'); }
    function closeSoon() { clearTimeout(timer); timer = setTimeout(close, CLOSE_DELAY); }

    item.addEventListener('mouseenter', open);
    item.addEventListener('mouseleave', closeSoon);
    trigger.addEventListener('click', e => {
      e.preventDefault();
      e.stopPropagation();
      if (item.classList.contains('is-open')) close();
      else open();
    });
    // Close after picking a submenu item
    item.querySelectorAll('.submenu a').forEach(a => {
      a.addEventListener('click', () => setTimeout(close, 0));
    });
  });

  document.addEventListener('click', e => {
    if (![...items].some(i => i.contains(e.target))) closeAll(null);
  });
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape') closeAll(null);
  });
})();

// Language switcher
(function () {
  const root = document.getElementById('langSwitch');
  if (!root) return;
  const toggle = root.querySelector('.lang-switch__toggle');
  const current = document.getElementById('langCurrent');
  const options = root.querySelectorAll('.lang-switch__option');

  const stored = localStorage.getItem('lf-lang');
  setLang(stored === 'en' ? 'en' : 'pt');

  function setLang(lang) {
    document.body.dataset.lang = lang;
    current.textContent = lang.toUpperCase();
    options.forEach(o => o.classList.toggle('is-active', o.dataset.langSet === lang));
    toggle.setAttribute('aria-expanded', 'false');
    root.classList.remove('is-open');
    document.querySelectorAll('[data-placeholder-' + lang + ']').forEach(el => {
      el.placeholder = el.dataset['placeholder' + lang.charAt(0).toUpperCase() + lang.slice(1)];
    });
    localStorage.setItem('lf-lang', lang);
  }

  toggle.addEventListener('click', e => {
    e.stopPropagation();
    const open = root.classList.toggle('is-open');
    toggle.setAttribute('aria-expanded', String(open));
  });
  options.forEach(o => o.addEventListener('click', () => setLang(o.dataset.langSet)));
  document.addEventListener('click', e => {
    if (!root.contains(e.target)) {
      root.classList.remove('is-open');
      toggle.setAttribute('aria-expanded', 'false');
    }
  });
})();

// FAQs page: search + topic filtering
(function () {
  const list = document.getElementById('faqs-list');
  const search = document.getElementById('faqs-search-input');
  const topics = document.getElementById('faqs-topics');
  if (!list || !search || !topics) return;

  let activeTopic = 'all';

  function applyFilter() {
    const q = search.value.trim().toLowerCase();
    const items = list.querySelectorAll('.faq-item');
    let visible = 0;
    items.forEach(item => {
      const topic = (item.dataset.topic || '').toLowerCase();
      const text = item.textContent.toLowerCase();
      const matchesTopic = activeTopic === 'all' || topic === activeTopic.toLowerCase();
      const matchesQuery = !q || text.includes(q);
      const show = matchesTopic && matchesQuery;
      item.classList.toggle('is-hidden', !show);
      if (show) visible++;
    });
    list.classList.toggle('is-empty', visible === 0);
  }

  search.addEventListener('input', applyFilter);
  topics.addEventListener('click', e => {
    const btn = e.target.closest('.faqs-topic');
    if (!btn) return;
    topics.querySelectorAll('.faqs-topic').forEach(b => b.classList.remove('is-active'));
    btn.classList.add('is-active');
    activeTopic = btn.dataset.topic || 'all';
    applyFilter();
  });
})();

// Scroll-triggered animations: fade-in for tagged elements + dashboard
// count-up sequence. Single IntersectionObserver handles both, with
// per-element thresholds. Each target fires once and is unobserved.
(function () {
  const fadeEls = document.querySelectorAll('.fade-in-on-scroll');
  const dash = document.querySelector('.dash-mock');
  if (!fadeEls.length && !dash) return;

  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const hasIO = 'IntersectionObserver' in window;

  // Brazilian currency formatter (created once, reused per frame).
  const BRL = new Intl.NumberFormat('pt-BR', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });

  // ---- Dashboard helpers ----
  function setBalanceTo(rootEl, value) {
    const intEl = rootEl.querySelector('.dash-mock__balance-int');
    const centsEl = rootEl.querySelector('.dash-mock__cents');
    const fixed = value.toFixed(2);
    const [intPart, decPart] = fixed.split('.');
    if (intEl) intEl.textContent = intPart.replace(/\B(?=(\d{3})+(?!\d))/g, '.');
    if (centsEl) centsEl.textContent = ',' + decPart;
  }

  function setStatTo(el, value) {
    const prefix = el.dataset.prefix || '';
    el.textContent = prefix + BRL.format(value);
  }

  // ease-out cubic
  function easeOut(t) { return 1 - Math.pow(1 - t, 3); }

  function countUp(el, target, duration, writeFn) {
    const start = performance.now();
    function tick(now) {
      const t = Math.min(1, (now - start) / duration);
      writeFn(el, target * easeOut(t));
      if (t < 1) requestAnimationFrame(tick);
      else writeFn(el, target); // snap to exact final value
    }
    requestAnimationFrame(tick);
  }

  function runDashboardSequence(root) {
    const balance = root.querySelector('.dash-mock__balance');
    const stats = root.querySelectorAll('.dash-mock__stat[data-count-up]');
    const rows = root.querySelector('.dash-mock__rows');

    if (reduced) {
      // Show final values instantly, skip pulse (handled by reduced-motion CSS).
      if (balance) {
        setBalanceTo(balance, parseFloat(balance.dataset.countUp));
        balance.classList.add('is-counting');
      }
      stats.forEach(s => {
        setStatTo(s, parseFloat(s.dataset.countUp));
        s.classList.add('is-counting');
      });
      if (rows) rows.classList.add('is-revealed');
      return;
    }

    // Balance: start at zero, count up over 1.2s, then add .is-live for pulse.
    if (balance) {
      setBalanceTo(balance, 0);
      balance.classList.add('is-counting');
      countUp(balance, parseFloat(balance.dataset.countUp), 1200, setBalanceTo);
      setTimeout(() => balance.classList.add('is-live'), 1200);
    }

    // Transaction rows: CSS handles the per-child 150ms stagger.
    if (rows) rows.classList.add('is-revealed');

    // Stat cards: kick off 800ms after dashboard enters viewport.
    setTimeout(() => {
      stats.forEach(s => {
        setStatTo(s, 0);
        s.classList.add('is-counting');
        countUp(s, parseFloat(s.dataset.countUp), 1200, setStatTo);
      });
    }, 800);
  }

  // ---- Fallbacks (reduced-motion or no IntersectionObserver) ----
  if (reduced || !hasIO) {
    fadeEls.forEach(el => el.classList.add('is-visible'));
    if (dash) runDashboardSequence(dash);
    return;
  }

  // ---- Single observer with multiple thresholds ----
  const viewportH = window.innerHeight;
  const observer = new IntersectionObserver((entries, obs) => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      const required = parseFloat(entry.target.dataset.observeThreshold || '0.15');
      if (entry.intersectionRatio < required) return;
      if (entry.target === dash) {
        runDashboardSequence(entry.target);
      } else {
        entry.target.classList.add('is-visible');
      }
      obs.unobserve(entry.target);
    });
  }, { threshold: [0.15, 0.3] });

  // Observe fade-in elements (default threshold 0.15).
  fadeEls.forEach(el => {
    const rect = el.getBoundingClientRect();
    if (rect.top < viewportH * 0.9) {
      el.classList.remove('fade-in-on-scroll');
      return;
    }
    observer.observe(el);
  });

  // Observe dashboard (threshold 0.3).
  if (dash) {
    dash.dataset.observeThreshold = '0.3';
    observer.observe(dash);
  }
})();

// Abrir Conta — account-opening request form.
// Validates the "Primeiros passos" fields + at least one document, then hands the
// payload to submitAbrirConta(). The submit is a STUB: it logs + saves a summary to
// localStorage so demo submissions aren't lost. Plug a real backend in the marked block.
(function () {
  const form = document.getElementById('abrir-conta-form');
  if (!form) return;

  const cnpj = form.querySelector('#abrir-cnpj');
  const celular = form.querySelector('#abrir-celular');
  const email = form.querySelector('#abrir-email');
  const ieField = form.querySelector('#abrir-ie');
  const isenta = form.querySelector('#abrir-ie-isenta');
  const errorEl = document.getElementById('abrir-form-error');

  // ---- Input masks ----
  function maskCNPJ(value) {
    const d = value.replace(/\D/g, '').slice(0, 14);
    let out = d.slice(0, 2);
    if (d.length > 2) out += '.' + d.slice(2, 5);
    if (d.length > 5) out += '.' + d.slice(5, 8);
    if (d.length > 8) out += '/' + d.slice(8, 12);
    if (d.length > 12) out += '-' + d.slice(12, 14);
    return out;
  }
  function maskPhone(value) {
    const d = value.replace(/\D/g, '').slice(0, 11);
    if (d.length <= 2) return d ? '(' + d : d;
    if (d.length <= 7) return '(' + d.slice(0, 2) + ') ' + d.slice(2);
    return '(' + d.slice(0, 2) + ') ' + d.slice(2, 7) + '-' + d.slice(7);
  }
  if (cnpj) cnpj.addEventListener('input', () => { cnpj.value = maskCNPJ(cnpj.value); });
  if (celular) celular.addEventListener('input', () => { celular.value = maskPhone(celular.value); });

  // Prefill CNPJ from the Conta PJ hero (?cnpj=...).
  const cnpjParam = new URLSearchParams(location.search).get('cnpj');
  if (cnpj && cnpjParam) cnpj.value = maskCNPJ(cnpjParam);

  // "Inscrição Estadual Isenta" disables + clears the IE field.
  if (isenta && ieField) {
    isenta.addEventListener('change', () => {
      ieField.disabled = isenta.checked;
      if (isenta.checked) { ieField.value = ''; ieField.classList.remove('is-invalid'); }
    });
  }

  // Clear the invalid flag as the user fixes a field.
  form.addEventListener('input', e => {
    if (e.target.classList) e.target.classList.remove('is-invalid');
  });

  form.addEventListener('submit', e => {
    e.preventDefault();

    const invalid = [];
    form.querySelectorAll('[required]').forEach(el => {
      if (el.disabled) return;
      if (el.type === 'file') { if (!el.files.length) invalid.push(el); }
      else if (!el.value.trim()) invalid.push(el);
    });
    if (email && email.value && !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email.value)) {
      if (invalid.indexOf(email) === -1) invalid.push(email);
    }

    form.querySelectorAll('.is-invalid').forEach(el => el.classList.remove('is-invalid'));
    if (invalid.length) {
      invalid.forEach(el => el.classList.add('is-invalid'));
      if (errorEl) errorEl.hidden = false;
      invalid[0].scrollIntoView({ behavior: 'smooth', block: 'center' });
      invalid[0].focus({ preventScroll: true });
      return;
    }
    if (errorEl) errorEl.hidden = true;

    submitAbrirConta(new FormData(form));
  });

  function submitAbrirConta(formData) {
    // Summarise text fields + file names (files themselves stay in formData).
    const summary = {};
    formData.forEach((v, k) => { if (!(v instanceof File)) summary[k] = v; });
    summary._files = formData.getAll('documentos')
      .filter(f => f && f.name).map(f => f.name);
    summary._submittedAt = new Date().toISOString();

    // === BACKEND: plug your real endpoint here ====================================
    // Replace the localStorage stub below with a real submission, e.g.:
    //   • Formspree/Web3Forms: fetch('https://formspree.io/f/XXXX', { method:'POST', body: formData })
    //   • Cloudflare Worker:   fetch('https://api.la-finteca.com/abrir-conta', { method:'POST', body: formData })
    //   • Apps Script:         fetch(APPS_SCRIPT_URL, { method:'POST', body: formData })
    // Use FormData (multipart) so the uploaded documents are sent with the fields.
    // Await the response, then call showSuccess(summary.email). Show errorEl on failure.
    try {
      const all = JSON.parse(localStorage.getItem('abrir-conta-submissions') || '[]');
      all.push(summary);
      localStorage.setItem('abrir-conta-submissions', JSON.stringify(all));
    } catch (_) { /* storage unavailable — non-fatal for the demo */ }
    console.log('[abrir-conta] submission (stub, not persisted server-side):', summary);
    // ============================================================================

    showSuccess(summary.email || '');
  }

  function showSuccess(addr) {
    form.hidden = true;
    const panel = document.getElementById('abrir-success');
    if (!panel) return;
    const emailEl = panel.querySelector('.abrir-success__email');
    if (emailEl) emailEl.textContent = addr;
    panel.hidden = false;
    panel.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }
})();
