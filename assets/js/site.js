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

// Scroll-triggered fade-in for tagged elements. Each element fades in once
// when it enters the viewport, then is unobserved.
(function () {
  const fadeEls = document.querySelectorAll('.fade-in-on-scroll');
  if (!fadeEls.length) return;

  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const hasIO = 'IntersectionObserver' in window;

  // ---- Fallback (reduced-motion or no IntersectionObserver) ----
  if (reduced || !hasIO) {
    fadeEls.forEach(el => el.classList.add('is-visible'));
    return;
  }

  const viewportH = window.innerHeight;
  const observer = new IntersectionObserver((entries, obs) => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      const required = parseFloat(entry.target.dataset.observeThreshold || '0.15');
      if (entry.intersectionRatio < required) return;
      entry.target.classList.add('is-visible');
      obs.unobserve(entry.target);
    });
  }, { threshold: [0.15, 0.3] });

  // Elements already near the top on load skip the animation.
  fadeEls.forEach(el => {
    const rect = el.getBoundingClientRect();
    if (rect.top < viewportH * 0.9) {
      el.classList.remove('fade-in-on-scroll');
      return;
    }
    observer.observe(el);
  });
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

  // === BACKEND ENDPOINT =========================================================
  // Paste the Apps Script web-app URL here after deploying crm/Code.gs
  //   (Deploy → New deployment → Web app → Execute as: Me → Access: Anyone).
  // Leave '' to run in local-demo mode (saves to localStorage only, no network).
  const ENDPOINT = '';
  // ==============================================================================

  const DOC_FIELDS = ['doc_constituicao', 'doc_cnpj', 'doc_identificacao', 'doc_faturamento', 'doc_endereco'];

  // Read a File as a bare base64 string (no "data:...;base64," prefix).
  function fileToBase64(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => { const r = String(reader.result); resolve(r.slice(r.indexOf(',') + 1)); };
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  }

  function newSubmissionId() {
    if (window.crypto && crypto.randomUUID) return crypto.randomUUID();
    return 'lf-' + Date.now().toString(36) + '-' + Math.random().toString(36).slice(2, 10);
  }

  // Local safety-net copy (without file bytes) in case the network call fails.
  function backupLocally(record) {
    try {
      const all = JSON.parse(localStorage.getItem('abrir-conta-submissions') || '[]');
      all.push(record);
      localStorage.setItem('abrir-conta-submissions', JSON.stringify(all));
    } catch (_) { /* storage unavailable — non-fatal */ }
  }

  function setSubmitting(on) {
    const btn = form.querySelector('button[type="submit"]');
    if (btn) { btn.disabled = on; btn.classList.toggle('is-loading', on); }
  }

  function showSubmitError() {
    if (!errorEl) return;
    // Rebuild the message as a network error (bilingual), using DOM nodes so the
    // language switcher's [data-lang] CSS keeps working and nothing is injected.
    const msgs = { pt: 'Não foi possível enviar agora. Verifique a sua conexão e tente novamente.',
                   en: 'We couldn\'t submit right now. Please check your connection and try again.' };
    errorEl.textContent = '';
    Object.keys(msgs).forEach(lang => {
      const span = document.createElement('span');
      span.setAttribute('data-lang', lang);
      span.textContent = msgs[lang];
      errorEl.appendChild(span);
    });
    errorEl.hidden = false;
    errorEl.scrollIntoView({ behavior: 'smooth', block: 'center' });
  }

  async function submitAbrirConta(formData) {
    // 1) Text fields.
    const fields = {};
    formData.forEach((v, k) => { if (!(v instanceof File)) fields[k] = v; });

    // 2) Documents → base64, grouped by upload box (one box per document type).
    const files = [];
    for (const field of DOC_FIELDS) {
      const list = formData.getAll(field).filter(f => f && f.name && f.size > 0);
      for (const file of list) {
        files.push({ field: field, name: file.name, mimeType: file.type || 'application/octet-stream', dataBase64: await fileToBase64(file) });
      }
    }

    const payload = { id: newSubmissionId(), submittedAt: new Date().toISOString(), fields: fields, files: files };
    backupLocally({ id: payload.id, submittedAt: payload.submittedAt, fields: fields, files: files.map(f => ({ field: f.field, name: f.name })) });

    // Local-demo mode (no endpoint wired yet).
    if (!ENDPOINT) {
      console.log('[abrir-conta] demo mode — saved to localStorage only:', payload.id);
      showSuccess(fields.email || '');
      return;
    }

    // 3) Deliver to the Apps Script web app. Posting text/plain with no custom
    //    headers keeps this a CORS "simple request" (no preflight); no-cors mode
    //    means we don't read the (opaque) response. The server is idempotent on
    //    payload.id, so a re-send never creates a duplicate folder or row.
    setSubmitting(true);
    try {
      await fetch(ENDPOINT, {
        method: 'POST',
        mode: 'no-cors',
        headers: { 'Content-Type': 'text/plain;charset=utf-8' },
        body: JSON.stringify(payload),
      });
      showSuccess(fields.email || '');
    } catch (err) {
      console.error('[abrir-conta] submission failed:', err);
      showSubmitError();
    } finally {
      setSubmitting(false);
    }
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

// Sticky nav: add .is-scrolled once the page scrolls past a small threshold,
// giving the header a translucent blurred backdrop + border for separation.
(function () {
  const header = document.querySelector('.header');
  if (!header) return;
  let ticking = false;
  function update() {
    header.classList.toggle('is-scrolled', window.scrollY > 8);
    ticking = false;
  }
  window.addEventListener('scroll', () => {
    if (!ticking) { window.requestAnimationFrame(update); ticking = true; }
  }, { passive: true });
  update();
})();
