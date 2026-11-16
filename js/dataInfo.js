/* ================================================================
 *  dataInfo.js – source-dataset descriptions, shared by
 *    timeseries*.html   translucent pop-up when the mouse is over a
 *                       product selector / variable toggle
 *    spatialData*.html  "Source datasets & references" rows in the
 *                       catalogue table
 *
 *  Edit the texts and links in DATA_INFO only; both pages read it.
 * ================================================================ */
(function () {
  'use strict';

  const LANG = (() => {
    const l = (document.documentElement.lang || 'en').toLowerCase();
    return l.startsWith('ru') ? 'ru' : l.startsWith('k') ? 'kz' : 'en';
  })();

  const T = {
    en: { source: 'Source', section: 'Source datasets & references', badge: 'Source',
          sectionNote: 'Products behind the water balance timeseries and the river network layer',
          role: { p: 'Precipitation (P)', e: 'Evapotranspiration (E)', q: 'Runoff (Q)',
                  s: 'Storage', v: 'Vector layer' } },
    ru: { source: 'Источник', section: 'Исходные наборы данных и ссылки', badge: 'Источник',
          sectionNote: 'Продукты, на которых основаны ряды водного баланса и слой речной сети',
          role: { p: 'Осадки (P)', e: 'Эвапотранспирация (E)', q: 'Сток (Q)',
                  s: 'Запасы воды', v: 'Векторный слой' } },
    kz: { source: 'Дереккөз', section: 'Бастапқы деректер жиынтықтары және сілтемелер', badge: 'Дереккөз',
          sectionNote: 'Су балансы қатарлары мен өзен желісі қабатының негізіндегі өнімдер',
          role: { p: 'Жауын-шашын (P)', e: 'Эвапотранспирация (E)', q: 'Ағын (Q)',
                  s: 'Су қоры', v: 'Векторлық қабат' } }
  }[LANG];

  /* url: '' → the reference is shown as plain text (no link) */
  const DATA_INFO = {
    grace: {
      title: 'GRACE', role: 's',
      ref: 'Li & Kusche (2026), GRL', url: 'https://doi.org/10.1029/2025GL119881',
      en: 'GRACE terrestrial water storage anomalies (TWSA), downscaled to 0.25° with a machine-learning method using ERA5 soil moisture, precipitation and temperature, while retaining nearly all of the original GRACE signal.',
      ru: 'Аномалии общих запасов воды на суше (TWSA) по данным GRACE, детализированные до 0,25° методом машинного обучения с использованием влажности почвы, осадков и температуры ERA5 при сохранении практически всего исходного сигнала GRACE.',
      kz: 'GRACE деректері бойынша құрлықтағы су қорының аномалиялары (TWSA); ERA5 топырақ ылғалдылығы, жауын-шашын және температура деректерін пайдаланатын машиналық оқыту әдісімен 0,25° дейін нақтыланған, бастапқы GRACE сигналы түгелге жуық сақталған.'
    },
    gires: {
      title: 'River Network (GIRES v10)', role: 'v',
      ref: 'Messager et al. (2021), Nature', url: 'https://doi.org/10.1038/s41586-021-03565-5',
      en: 'Global river network of ~6.2 million reaches, each with a predicted probability of flow intermittence and an intermittent/perennial class.',
      ru: 'Глобальная речная сеть из ~6,2 млн участков; для каждого рассчитаны вероятность пересыхания стока и класс: пересыхающий или постоянный.',
      kz: 'Шамамен 6,2 млн өзен учаскесінен тұратын жаһандық өзен желісі; әр учаске үшін ағынның үзілу ықтималдығы және үзілмелі/тұрақты класы есептелген.'
    },
    gleam: {
      title: 'GLEAM v4.2a, v4.3a', role: 'e',
      ref: 'gleam.eu', url: 'https://www.gleam.eu/',
      en: 'Satellite-based estimates of terrestrial evaporation and its components, plus soil moisture, on a daily 0.1° grid; v4.3a covers 1980–2024.',
      ru: 'Спутниковые оценки суммарного испарения с суши и его составляющих, а также влажности почвы на суточной сетке 0,1°; v4.3a охватывает 1980–2024 гг.',
      kz: 'Құрлықтан булану мен оның құрамдас бөліктерінің, сондай-ақ топырақ ылғалдылығының спутниктік бағалаулары; тәуліктік 0,1° тор; v4.3a 1980–2024 жж. қамтиды.'
    },
    mswep: {
      title: 'MSWEP v2.8, v3.16', role: 'p',
      ref: 'GloH2O', url: 'https://www.gloh2o.org/mswep/',
      en: 'Global precipitation merging gauge, satellite and model estimates, 1979–present at 0.1° (V2: 3-hourly; V3: hourly).',
      ru: 'Глобальные осадки, объединяющие данные осадкомеров, спутников и моделей, с 1979 г. по настоящее время на сетке 0,1° (V2 — 3-часовые; V3 — часовые).',
      kz: 'Жауын-шашын өлшегіш, спутник және модель деректерін біріктіретін жаһандық жауын-шашын өнімі; 1979 ж. бастап бүгінге дейін, 0,1° (V2 — 3 сағаттық; V3 — сағаттық).'
    },
    pml: {
      title: 'PML v2.2c', role: 'e',
      ref: 'Xu et al. (2026), ESSD', url: 'https://doi.org/10.5194/essd-18-5663-2026',
      en: 'Global terrestrial ET (with transpiration, soil evaporation, interception) and GPP at 0.1°, half-monthly, 1982–2025.',
      ru: 'Глобальная эвапотранспирация суши (транспирация, испарение с почвы, перехват) и валовая первичная продукция (GPP) на сетке 0,1°, с шагом полмесяца, 1982–2025 гг.',
      kz: 'Құрлықтың жаһандық эвапотранспирациясы (транспирация, топырақтан булану, интерцепция) және жалпы бастапқы өнім (GPP); 0,1°, жарты айлық қадам, 1982–2025 жж.'
    },
    era5: {
      title: 'ERA5 / ERA5-Land', role: 'q',
      ref: 'Copernicus C3S, doi:10.24381/cds.f17050d7', url: 'https://doi.org/10.24381/cds.f17050d7',
      en: 'ERA5 monthly mean data on single levels, available from 1940 onwards.',
      ru: 'Среднемесячные данные ERA5 на одиночных уровнях, доступны с 1940 г.',
      kz: 'ERA5 жеке деңгейлердегі айлық орташа деректері, 1940 ж. бастап қолжетімді.'
    },
    watergap: {
      title: 'WaterGAP v2.2e', role: 'q',
      ref: 'Müller Schmied et al. (2024), GMD', url: 'https://doi.org/10.5194/gmd-17-8817-2024',
      en: 'Global water resources and water use model at 0.5° with daily time steps.',
      ru: 'Глобальная модель водных ресурсов и водопользования с разрешением 0,5° и суточным шагом.',
      kz: '0,5° ажыратымдылықтағы, тәуліктік қадамды жаһандық су ресурстары және су пайдалану моделі.'
    },
    era5bc: {
      title: 'ERA5BC', role: 'p',
      ref: '', url: '',
      en: 'ERA5 bias correction.',
      ru: 'ERA5 с коррекцией систематических ошибок.',
      kz: 'Жүйелі қателері түзетілген ERA5.'
    }
  };

  /** Product key used by the dashboard (e.g. "mswep_v_3_16") → DATA_INFO id */
  function infoIdForProduct (key) {
    const k = String(key || '').toLowerCase();
    if (k.startsWith('era5bc'))   return 'era5bc';
    if (k.startsWith('mswep'))    return 'mswep';
    if (k.startsWith('gleam'))    return 'gleam';
    if (k.startsWith('pml'))      return 'pml';
    if (k.startsWith('watergap')) return 'watergap';
    if (k.startsWith('era5'))     return 'era5';
    if (k.startsWith('grace'))    return 'grace';
    return null;
  }

  const esc = s => String(s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));

  function refHtml (info, cls) {
    if (!info.ref) return '';
    return info.url
      ? `<a class="${cls || ''}" href="${esc(info.url)}" target="_blank" rel="noopener">${esc(info.ref)} ↗</a>`
      : esc(info.ref);
  }

  /* ================================================================
   *  Hover pop-up (timeseries dashboard)
   * ================================================================ */
  let pop = null, hideTimer = null, currentAnchor = null;

  function ensurePop () {
    if (pop) return pop;
    pop = document.createElement('div');
    pop.className = 'data-info-pop';
    pop.setAttribute('role', 'tooltip');
    pop.addEventListener('mouseenter', () => clearTimeout(hideTimer));
    pop.addEventListener('mouseleave', scheduleHide);
    document.body.appendChild(pop);
    return pop;
  }

  function showPop (anchor, id, selectedLabel) {
    const info = DATA_INFO[id];
    if (!info) { hidePop(); return; }
    clearTimeout(hideTimer);
    const el = ensurePop();
    const ref = refHtml(info);
    const tag = selectedLabel && selectedLabel !== info.title
      ? `<span class="dip-tag">${esc(selectedLabel)}</span>` : '';
    el.innerHTML =
      `<div class="dip-role">${esc(T.role[info.role] || '')}</div>` +
      `<div class="dip-title">${esc(info.title)}${tag}</div>` +
      `<div class="dip-desc">${esc(info[LANG] || info.en)}</div>` +
      (ref ? `<div class="dip-ref"><span>${esc(T.source)}:</span> ${ref}</div>` : '');
    currentAnchor = anchor;
    el.classList.add('is-visible');
    placePop(anchor);
  }

  function placePop (anchor) {
    const r   = anchor.getBoundingClientRect();
    const pw  = pop.offsetWidth, ph = pop.offsetHeight;
    const vw  = document.documentElement.clientWidth;
    const vh  = document.documentElement.clientHeight;
    const gap = 12;
    let left, top;
    if (r.right + gap + pw <= vw - 8) {            // to the right of the control
      left = r.right + gap;
      top  = r.top;
    } else {                                        // narrow screens: below it
      left = r.left;
      top  = r.bottom + 6;
      if (top + ph > vh - 8) top = r.top - ph - 6;
    }
    left = Math.max(8, Math.min(left, vw - pw - 8));
    top  = Math.max(8, Math.min(top,  vh - ph - 8));
    pop.style.left = left + 'px';
    pop.style.top  = top + 'px';
  }

  function hidePop () {
    clearTimeout(hideTimer);
    if (pop) pop.classList.remove('is-visible');
    currentAnchor = null;
  }
  function scheduleHide () {
    clearTimeout(hideTimer);
    hideTimer = setTimeout(hidePop, 220);
  }

  /** resolve() returns { id, label } or null for the control's current state */
  function bindHover (anchor, resolve) {
    if (!anchor) return;
    const show = () => {
      const r = resolve();
      if (r && r.id) showPop(anchor, r.id, r.label); else hidePop();
    };
    anchor.addEventListener('mouseenter', show);
    anchor.addEventListener('mouseleave', scheduleHide);
    anchor.addEventListener('focusin', show);
    anchor.addEventListener('focusout', scheduleHide);
    anchor.addEventListener('change', () => { if (currentAnchor === anchor) show(); });
  }

  function initDashboard () {
    const $ = id => document.getElementById(id);
    const selects = { P: $('wbSelP'), E: $('wbSelE'), Q: $('wbSelQ') };
    if (!selects.P && !selects.E && !selects.Q) return;

    const fromSelect = sel => () => {
      if (!sel || !sel.value) return null;
      const opt = sel.options[sel.selectedIndex];
      return { id: infoIdForProduct(sel.value), label: opt ? opt.textContent.trim() : '' };
    };
    const grace = () => ({ id: 'grace', label: '' });
    const forVariable = v => v === 'GRACE_storage' ? grace
                           : selects[v] ? fromSelect(selects[v]) : () => null;

    // P / E / Q product selectors → the product currently selected
    Object.values(selects).forEach(sel => bindHover(sel, fromSelect(sel)));

    // Variable toggles: P, E, Q → their selected product; GRACE → GRACE
    ['P', 'E', 'Q', 'GRACE_storage'].forEach(v => {
      const cb = $('wbShow_' + v);
      bindHover(cb && cb.closest('label'), forVariable(v));
    });

    // Metric selector follows the metric currently chosen
    const metric = $('metricSelect');
    bindHover(metric, () => forVariable(metric.value)());

    window.addEventListener('scroll', hidePop, true);
    window.addEventListener('resize', hidePop);
    document.addEventListener('keydown', e => { if (e.key === 'Escape') hidePop(); });
  }

  /* ================================================================
   *  Catalogue rows (spatialData pages)
   * ================================================================ */
  function initCatalogue () {
    const tbody = document.querySelector('#dataTable tbody');
    if (!tbody) return;

    // Existing River Network row: fuller description + reference
    const riverRow = [...tbody.rows].find(r => r.cells.length > 1 && /GIRES/i.test(r.cells[0].textContent));
    if (riverRow) {
      const g = DATA_INFO.gires;
      riverRow.cells[1].innerHTML =
        `${esc(g[LANG] || g.en)}<div class="data-src-ref">${esc(T.source)}: ${refHtml(g)}</div>`;
    }

    const badge = `<span class="badge" style="background:#5a4a8a;font-family:'Roboto Condensed',sans-serif;">${esc(T.badge)}</span>`;
    const rows = ['grace', 'mswep', 'era5bc', 'gleam', 'pml', 'era5', 'watergap'].map(id => {
      const d = DATA_INFO[id];
      return `<tr>
        <td><strong>${esc(d.title)}</strong><div class="data-src-role">${esc(T.role[d.role] || '')}</div></td>
        <td>${esc(d[LANG] || d.en)}</td>
        <td>${badge}</td>
        <td>${refHtml(d, 'btn btn-sm btn-outline-secondary') || '—'}</td>
      </tr>`;
    }).join('');

    tbody.insertAdjacentHTML('beforeend', `
      <tr>
        <td colspan="4" style="background:#f3f1f8;padding:10px 14px;border-left:4px solid #5a4a8a;">
          <strong style="font-family:'Roboto Condensed',sans-serif;font-size:0.85rem;letter-spacing:0.06em;color:#5a4a8a;text-transform:uppercase;">
            ◈ ${esc(T.section)}
          </strong>
          <span style="font-size:0.78rem;color:#6c757d;margin-left:10px;">${esc(T.sectionNote)}</span>
        </td>
      </tr>${rows}`);
  }

  function init () { initDashboard(); initCatalogue(); }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();
