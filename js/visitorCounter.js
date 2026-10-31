/* ================================================================
 *  visitorCounter.js – site-wide visit counter in the footer
 *
 *  Uses GoatCounter (https://www.goatcounter.com): no cookies, no
 *  personal data. Set GC_CODE to the site code chosen at sign-up and,
 *  in GoatCounter › Settings, tick "Allow adding visitor counts on
 *  your website" so /counter/TOTAL.json is public.
 *  Visits from localhost are not counted (GoatCounter default).
 * ================================================================ */

(function () {
  const GC_CODE = 'waterbalance';                       // ← GoatCounter site code
  const GC_BASE = `https://${GC_CODE}.goatcounter.com`;
  if (location.protocol === 'file:' || /^(localhost|127\.|0\.0\.0\.0|\[::1\])/.test(location.hostname)) return;

  const lang  = (document.documentElement.lang || 'en').toLowerCase();
  const label = lang.startsWith('ru') ? 'посещений' : lang.startsWith('k') ? 'рет кірген' : 'visits';
  const title = lang.startsWith('ru') ? 'Всего посещений портала' : lang.startsWith('k') ? 'Порталға кірудің жалпы саны'
              : 'Total visits to the portal';

  /* 1. count this page view */
  const s = document.createElement('script');
  s.async = true;
  s.src = 'https://gc.zgo.at/count.js';
  s.dataset.goatcounter = `${GC_BASE}/count`;
  document.head.appendChild(s);

  /* 2. show the site total in the footer (stays hidden if the service is unreachable) */
  const line = document.querySelector('footer.nla-footer .container > div, footer.nla-footer .container-fluid > div');
  if (!line) return;
  const el = document.createElement('span');
  el.className = 'nla-visits';
  el.title = title;
  el.hidden = true;
  line.appendChild(el);

  fetch(`${GC_BASE}/counter/TOTAL.json`)
    .then(r => (r.ok ? r.json() : Promise.reject(r.status)))
    .then(j => {
      if (!j || j.count == null) return;
      el.innerHTML = `<span class="footer-divider">|</span><span aria-hidden="true">&#128065;</span> ` +
                     `<strong>${String(j.count).replace(/[^\d\s,.  ]/g, '')}</strong> ${label}`;
      el.hidden = false;
    })
    .catch(() => { /* counter not available – leave footer unchanged */ });
})();
