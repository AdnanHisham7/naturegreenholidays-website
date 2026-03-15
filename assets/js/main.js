/* ================================================
   Nature Green Holidays — Main JS
   Analytics events, mobile nav, FAQ, scroll-top
   ================================================ */

// ── Config (replace with real IDs before deploying) ──
const NGH_CONFIG = {
  GA4_ID:      'G-SMHDC7HFKN',          // ← Replace with your GA4 Measurement ID
  GTM_ID:      'GTM-5DXDDNW8',           // ← Replace with your GTM Container ID
  WA_NUMBER:   '917012112733',          // WhatsApp number (country code + number)
  PHONE:       'tel:+917012112733',
  FORMSPREE:   'https://formspree.io/f/XXXXXXXX', // ← Replace with Formspree endpoint
};

// ── dataLayer helper ──
window.dataLayer = window.dataLayer || [];
function pushEvent(eventName, params) {
  window.dataLayer.push({ event: eventName, ...params });
}

// ── Sticky header on scroll ──
(function () {
  const header = document.querySelector('.ngh-header');
  if (!header) return;
  const onScroll = () => header.classList.toggle('scrolled', window.scrollY > 60);
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();
})();

// ── Mobile nav ──
(function () {
  const btn   = document.getElementById('hamburger');
  const nav   = document.getElementById('mobile-nav');
  const close = document.getElementById('mobile-nav-close');
  if (!btn || !nav) return;

  function openNav() {
    nav.classList.add('open');
    btn.setAttribute('aria-expanded', 'true');
    document.body.style.overflow = 'hidden';
    close.focus();
  }
  function closeNav() {
    nav.classList.remove('open');
    btn.setAttribute('aria-expanded', 'false');
    document.body.style.overflow = '';
    btn.focus();
  }

  btn.addEventListener('click', openNav);
  close.addEventListener('click', closeNav);
  nav.addEventListener('click', (e) => { if (e.target === nav) closeNav(); });
  document.addEventListener('keydown', (e) => { if (e.key === 'Escape' && nav.classList.contains('open')) closeNav(); });
})();

// ── Scroll-to-top button ──
(function () {
  const btn = document.getElementById('scroll-top');
  if (!btn) return;
  window.addEventListener('scroll', () => btn.classList.toggle('visible', window.scrollY > 400), { passive: true });
  btn.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));
})();

// ── FAQ accordion ──
(function () {
  document.querySelectorAll('.faq-question').forEach(btn => {
    btn.addEventListener('click', () => {
      const expanded = btn.getAttribute('aria-expanded') === 'true';
      // close all
      document.querySelectorAll('.faq-question').forEach(b => {
        b.setAttribute('aria-expanded', 'false');
        b.nextElementSibling?.classList.remove('open');
      });
      if (!expanded) {
        btn.setAttribute('aria-expanded', 'true');
        btn.nextElementSibling?.classList.add('open');
      }
    });
  });
})();

// ── Tracking: WhatsApp clicks ──
document.querySelectorAll('a[href*="wa.me"]').forEach(el => {
  el.addEventListener('click', () => {
    pushEvent('whatsapp_click', {
      click_url: el.href,
      click_text: el.textContent.trim() || 'WhatsApp Button',
    });
  });
});

// ── Tracking: Phone clicks ──
document.querySelectorAll('a[href^="tel:"]').forEach(el => {
  el.addEventListener('click', () => {
    pushEvent('phone_click', { phone_number: el.href.replace('tel:', '') });
  });
});

// ── Tracking: Package book clicks ──
document.querySelectorAll('[data-track="package_book"]').forEach(el => {
  el.addEventListener('click', () => {
    pushEvent('package_book_click', {
      package_name: el.dataset.package || 'unknown',
    });
  });
});

// ── Lead Form handling ──
(function () {
  const form = document.getElementById('lead-form');
  if (!form) return;

  // Preserve UTMs through form
  const urlParams = new URLSearchParams(window.location.search);
  ['utm_source','utm_medium','utm_campaign','utm_content','utm_term'].forEach(param => {
    if (urlParams.has(param)) {
      const hidden = document.createElement('input');
      hidden.type = 'hidden';
      hidden.name = param;
      hidden.value = urlParams.get(param);
      form.appendChild(hidden);
    }
  });

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const submitBtn = form.querySelector('[type="submit"]');
    const origText = submitBtn.textContent;
    submitBtn.disabled = true;
    submitBtn.textContent = 'Sending…';

    const data = new FormData(form);
    const payload = Object.fromEntries(data.entries());

    // Push form_submit event
    pushEvent('form_submit', {
      form_name: 'lead_inquiry',
      destination: payload.destination || '',
    });

    try {
      const res = await fetch(NGH_CONFIG.FORMSPREE, {
        method: 'POST', headers: { 'Accept': 'application/json' }, body: data,
      });
      if (res.ok) {
        window.location.href = '/thank-you.html' +
          (window.location.search ? window.location.search : '');
      } else {
        throw new Error('Server error');
      }
    } catch {
      submitBtn.disabled = false;
      submitBtn.textContent = origText;
      alert('Sorry, there was an error. Please WhatsApp or call us directly.');
    }
  });
})();

// ── Lazy-load images polyfill (Safari < 15.4) ──
if ('loading' in HTMLImageElement.prototype === false) {
  document.querySelectorAll('img[loading="lazy"]').forEach(img => {
    if (img.dataset.src) img.src = img.dataset.src;
  });
}

// ── Active nav link ──
(function () {
  const path = window.location.pathname.split('/').pop() || 'index.html';
  document.querySelectorAll('.ngh-nav a, .ngh-mobile-nav__panel a').forEach(a => {
    const href = a.getAttribute('href');
    if (href === path || (path === '' && href === 'index.html')) {
      a.classList.add('active');
      a.setAttribute('aria-current', 'page');
    }
  });
})();
