/* ================================================================
 *  wbHandler.js – Water Balance Products: data, chart, statistics
 *
 *  The Timeseries dashboard shows only WB Products (3 P × 3 E × 3 Q
 *  = 27 combinations) for two basin layers:
 *    watersheds  14 basins (NWB_/SWB_)  ALL_watersheds_wgs84.geojson
 *    basins      8 WM basins (WMB_)     Water management basins.geojson
 *  Sub-basins have no WB data yet.
 *
 *  Data layout (input_data/wb_products/):
 *    map/<layer>/index.json       basins + combination list
 *    map/<layer>/<combo>.json     all basins × 6 variables for one
 *                                 combination (dashboard file)
 *    json/<ID>_<slug>.json        per-basin file, all 27 combinations
 *    csv/<ID>_<slug>.csv          long-format table, all combinations
 *    xlsx/<ID>_<slug>/*.xlsx      original Excel files
 *    zip/<ID>_<slug>_xlsx.zip     Excel bundle per basin
 *
 *  Monthly values are labelled by the first day of the month, so the
 *  record runs 01.10.2002 – 30.09.2023 (hydrological years 2003–2023).
 * ================================================================ */

/* ---- Language ------------------------------------------------- */
const WB_LANG = (() => {
  const l = (document.documentElement.lang || 'en').toLowerCase();
  return l.startsWith('ru') ? 'ru' : l.startsWith('k') ? 'kz' : 'en';
})();

const WB_I18N = {
  en: {
    clickBasin: 'Click a basin on the map', none: 'None', allBasins: 'All basins',
    date: 'Date', mean: 'Mean (mm/mo)', variable: 'Variable',
    leftAxis: 'P, E, Q  (mm/month)', rightAxis: 'P−E · WB Storage · GRACE  (mm/month)',
    vars: {
      P: 'P – Precipitation', E: 'E – Evapotranspiration', Q: 'Q – Runoff',
      PE: 'P−E – Water Availability', WB_storage: 'WB Storage ΔS = P−E−Q', GRACE_storage: 'GRACE Storage – Satellite'
    }
  },
  ru: {
    clickBasin: 'Нажмите на бассейн на карте', none: 'Нет', allBasins: 'Все бассейны',
    date: 'Дата', mean: 'Среднее (мм/мес)', variable: 'Переменная',
    leftAxis: 'P, E, Q  (мм/мес)', rightAxis: 'P−E · ΔS баланс · GRACE  (мм/мес)',
    vars: {
      P: 'P – Осадки', E: 'E – Эвапотранспирация', Q: 'Q – Сток',
      PE: 'P−E – Доступная вода', WB_storage: 'ΔS баланс = P−E−Q', GRACE_storage: 'GRACE – спутник'
    }
  },
  kz: {
    clickBasin: 'Картадағы бассейнді басыңыз', none: 'Жоқ', allBasins: 'Барлық бассейндер',
    date: 'Күні', mean: 'Орташа (мм/ай)', variable: 'Айнымалы',
    leftAxis: 'P, E, Q  (мм/ай)', rightAxis: 'P−E · ΔS балансы · GRACE  (мм/ай)',
    vars: {
      P: 'P – Жауын-шашын', E: 'E – Эвапотранспирация', Q: 'Q – Ағын',
      PE: 'P−E – Қолжетімді су', WB_storage: 'ΔS балансы = P−E−Q', GRACE_storage: 'GRACE – спутник'
    }
  }
};
const WB_T = WB_I18N[WB_LANG];

/* ---- Layers with WB data -------------------------------------- */
const WB_MAP_DIR = 'input_data/wb_products/map/';
const WB_LAYER_DIRS = { watersheds: 'watersheds', basins: 'wm_basins' };

/* ---- Product selectors (P / E / Q) ---------------------------- */
const WB_PRODUCT_SELECTS = { p: 'wbSelP', e: 'wbSelE', q: 'wbSelQ' };

/* ---- Variable display config ---------------------------------- */
// yAxisID: 'y'  = left axis  (raw fluxes: P, E, Q)
// yAxisID: 'y1' = right axis (derived: P-E, WB storage, GRACE)
// ramp: choropleth colours; diverging ramps are centred on zero
const WB_VAR_CONFIG = [
  { key: 'P',             short: 'P',     color: '#2196F3', dash: [],     yAxisID: 'y',
    ramp: ['#eff3ff','#bdd7e7','#6baed6','#3182bd','#08519c'] },
  { key: 'E',             short: 'E',     color: '#FF5722', dash: [],     yAxisID: 'y',
    ramp: ['#fff5eb','#fdbe85','#fd8d3c','#e6550d','#a63603'] },
  { key: 'Q',             short: 'Q',     color: '#4CAF50', dash: [],     yAxisID: 'y',
    ramp: ['#edf8e9','#bae4b3','#74c476','#31a354','#006d2c'] },
  { key: 'PE',            short: 'P−E',   color: '#9C27B0', dash: [6,3],  yAxisID: 'y1', diverging: true,
    ramp: ['#a6611a','#dfc27d','#f5f5f5','#80cdc1','#018571'] },
  { key: 'WB_storage',    short: 'WB ΔS', color: '#0D47A1', dash: [4,2],  yAxisID: 'y1', diverging: true,
    ramp: ['#a6611a','#dfc27d','#f5f5f5','#80cdc1','#018571'] },
  { key: 'GRACE_storage', short: 'GRACE', color: '#FF8F00', dash: [10,4], yAxisID: 'y1', diverging: true,
    ramp: ['#a6611a','#dfc27d','#f5f5f5','#80cdc1','#018571'] },
];
const WB_VAR = Object.fromEntries(WB_VAR_CONFIG.map(c => [c.key, c]));
const wbVarLabel = key => `${WB_T.vars[key]} (mm/mo)`;

/* ---- State ---------------------------------------------------- */
let wbLayerKey      = null;      // 'watersheds' | 'basins' | other (no data)
let wbIndex         = null;      // map/<layer>/index.json
let wbCombo         = null;      // map/<layer>/<combo>.json
let wbActiveBasinId = null;      // null = all basins
let wbMetric        = 'P';
let wbDateIndex     = 0;
let wbChart         = null;
const wbCache       = {};        // url -> parsed JSON

const wbEl = id => document.getElementById(id);

function wbFetch (url) {
  if (!wbCache[url]) {
    wbCache[url] = fetch(url).then(r => {
      if (!r.ok) throw new Error(`${r.status} ${url}`);
      return r.json();
    }).catch(err => { delete wbCache[url]; throw err; });
  }
  return wbCache[url];
}

/* ================================================================
 *  Public API (called from mapHandler)
 * ================================================================ */

/** Switch the active basin layer; loads its index + current combination */
window.wbSetLayer = function (layerKey) {
  wbLayerKey      = layerKey;
  wbActiveBasinId = null;
  wbCombo         = null;
  wbUpdateBasinNameDisplay();

  const dir = WB_LAYER_DIRS[layerKey];
  if (!dir) {                       // e.g. sub-basins: no data yet
    wbIndex = null;
    wbClearChart();
    wbUpdateStats();
    window.onWBDataReady?.();
    return;
  }

  wbFetch(`${WB_MAP_DIR}${dir}/index.json`)
    .then(index => {
      if (wbLayerKey !== layerKey) return;
      wbIndex = index;
      wbPopulateSelectors(index.combinations);
      wbLoadCombo();
    })
    .catch(err => console.error('[wbHandler] index load error:', err));
};

/** Select one basin (id) or return to all basins (null) */
window.wbSelectBasin = function (basinId) {
  wbActiveBasinId = basinId && wbCombo?.basins?.[basinId] ? basinId : null;
  wbUpdateBasinNameDisplay();
  wbDrawChart();
  wbUpdateStats();
};

window.wbSetMetric = function (key) {
  wbMetric = key;
  if (!wbActiveBasinId) wbDrawChart();
  wbUpdateStats();
};

window.wbSetDateIndex = function (i) {
  wbDateIndex = i;
  wbHighlightPoint(i);
};

window.wbDates     = () => wbCombo?.dates || [];
window.wbHasData   = () => !!wbCombo;
window.wbBasinName = id => wbCombo?.basins?.[id]?.name;
window.wbValue     = (id, key, i) => {
  const v = wbCombo?.basins?.[id]?.[key]?.[i];
  return Number.isFinite(v) ? v : null;
};

/** Fixed class breaks for a variable over the whole record (stable while playing) */
window.wbBreaks = function (key) {
  const vals = Object.values(wbCombo?.basins || {})
    .flatMap(b => b[key] || [])
    .filter(Number.isFinite);
  if (!vals.length) return null;
  let min = Math.min(...vals), max = Math.max(...vals);
  if (WB_VAR[key]?.diverging) {
    const m = Math.max(Math.abs(min), Math.abs(max));
    return [-m, -0.6 * m, -0.2 * m, 0.2 * m, 0.6 * m, m];
  }
  const step = (max - min) / 5;
  return Array.from({ length: 6 }, (_, i) => min + i * step);
};

/* ================================================================
 *  Internal – selectors & loading
 * ================================================================ */

/** Fill P / E / Q selectors, keeping the user's previous choice */
function wbPopulateSelectors (combinations) {
  Object.entries(WB_PRODUCT_SELECTS).forEach(([k, id]) => {
    const sel  = wbEl(id);
    const prev = sel.value;
    const opts = new Map(combinations.map(c => [c[`${k}_key`], c[`${k}_label`]]));
    sel.innerHTML = [...opts]
      .map(([key, label]) => `<option value="${key}">${label}</option>`)
      .join('');
    if (opts.has(prev)) sel.value = prev;
  });
}

/** Combination matching the current P / E / Q selector values */
function wbFindComboKey () {
  const [p, e, q] = Object.values(WB_PRODUCT_SELECTS).map(id => wbEl(id).value);
  const list = wbIndex?.combinations || [];
  return (list.find(c => c.p_key === p && c.e_key === e && c.q_key === q) || list[0])?.key;
}

function wbLoadCombo () {
  const key = wbFindComboKey();
  const dir = WB_LAYER_DIRS[wbLayerKey];
  if (!key || !dir) return;

  const layerKey = wbLayerKey;
  wbEl('wb-loading').style.display = '';

  wbFetch(`${WB_MAP_DIR}${dir}/${key}.json`)
    .then(combo => {
      if (wbLayerKey !== layerKey) return;
      wbCombo = combo;
      if (wbActiveBasinId && !combo.basins[wbActiveBasinId]) wbActiveBasinId = null;
      wbDateIndex = Math.min(wbDateIndex, combo.dates.length - 1);
      wbEl('wb-loading').style.display = 'none';
      wbDrawChart();
      wbUpdateStats();
      window.onWBDataReady?.();
    })
    .catch(err => {
      console.error('[wbHandler] load error:', err);
      wbEl('wb-loading').style.display = 'none';
    });
}

/* ================================================================
 *  Internal – helpers
 * ================================================================ */

function wbUpdateBasinNameDisplay () {
  const el = wbEl('wbBasinName');
  if (!el) return;
  el.textContent = wbActiveBasinId
    ? `${window.wbBasinName(wbActiveBasinId)} — ${wbActiveBasinId}`
    : WB_T.clickBasin;
}

/** "01.09.2023" → "30.09.2023" (last day of that month) */
function wbMonthEnd (d) {
  const [, mm, yyyy] = d.split('.');
  const last = new Date(Date.UTC(+yyyy, +mm, 0)).getUTCDate();
  return `${String(last).padStart(2, '0')}.${mm}.${yyyy}`;
}

function wbPeriod (dates) {
  return dates.length ? `${dates[0]} – ${wbMonthEnd(dates[dates.length - 1])}` : '';
}

function wbHighlightPoint (index) {
  if (!wbChart) return;
  wbChart.data.datasets.forEach(ds => {
    ds.pointRadius = ds.data.map((_, i) => (i === index ? 6 : 0));
  });
  wbChart.update('none');
}

function wbClearChart () {
  if (wbChart) { wbChart.destroy(); wbChart = null; }
  window.wbChart = null;
}

/* ================================================================
 *  Internal – chart drawing
 * ================================================================ */
function wbDrawChart () {
  wbClearChart();
  if (!wbCombo) return;

  const single = !!wbActiveBasinId;
  const labels = wbCombo.dates;
  let datasets, title, scales;

  const xScale = {
    title: { display: true, text: WB_T.date, font: { size: 11 } },
    ticks: { maxTicksLimit: 18, autoSkip: true, font: { size: 10 } }
  };

  if (single) {
    // One basin – all six variables on two axes
    const basin = wbCombo.basins[wbActiveBasinId];
    datasets = WB_VAR_CONFIG
      .filter(cfg => wbEl(`wbShow_${cfg.key}`)?.checked !== false)
      .map(cfg => ({
        label:           wbVarLabel(cfg.key),
        data:            basin[cfg.key],
        borderColor:     cfg.color,
        backgroundColor: cfg.color + '18',
        borderWidth:     ['WB_storage','GRACE_storage'].includes(cfg.key) ? 2.5 : 2,
        fill:            false,
        tension:         0.15,
        borderDash:      cfg.dash,
        pointRadius:     0,
        pointHoverRadius:5,
        yAxisID:         cfg.yAxisID,
      }));
    title = [`${basin.name}  (${wbActiveBasinId})`, wbCombo.label];
    scales = {
      x: xScale,
      y: {
        type: 'linear', position: 'left',
        title: { display: true, text: WB_T.leftAxis, font: { size: 11 } },
        grid:  { color: 'rgba(0,0,0,0.06)' },
        ticks: { font: { size: 10 } }
      },
      y1: {
        type: 'linear', position: 'right',
        title: { display: true, text: WB_T.rightAxis, font: { size: 11 } },
        grid:  { drawOnChartArea: false },
        ticks: { font: { size: 10 } }
      }
    };
  } else {
    // All basins – selected metric, one line per basin
    datasets = Object.entries(wbCombo.basins).map(([id, b]) => {
      const color = getColorForBasin(id);
      return {
        label:           b.name,
        data:            b[wbMetric],
        borderColor:     color,
        backgroundColor: color,
        borderWidth:     1.5,
        fill:            false,
        tension:         0.1,
        pointRadius:     0,
        pointHoverRadius:5
      };
    });
    title = [`${wbVarLabel(wbMetric)} — ${WB_T.allBasins}`, wbCombo.label];
    scales = {
      x: xScale,
      y: {
        title: { display: true, text: wbVarLabel(wbMetric), font: { size: 11 } },
        grid:  { color: 'rgba(0,0,0,0.06)' },
        ticks: { font: { size: 10 } }
      }
    };
  }

  wbChart = new Chart(wbEl('chart'), {
    type: 'line',
    data: { labels, datasets },
    options: {
      responsive:          true,
      maintainAspectRatio: false,
      interaction: { mode: 'index', intersect: false },
      plugins: {
        title: {
          display: true,
          text:    title,
          font:    { size: 13, weight: 'bold' },
          padding: { top: 8, bottom: 4 },
          color:   '#0e1c36'
        },
        legend: {
          position: 'bottom',
          labels:   { font: { size: 11 }, boxWidth: 28, padding: 12 }
        },
        tooltip: {
          callbacks: {
            label: ctx => {
              const v = ctx.raw;
              return `${ctx.dataset.label}: ${v != null ? v.toFixed(2) : 'N/A'}`;
            }
          }
        },
        zoom: {
          pan:  { enabled: true, mode: 'x', modifierKey: 'ctrl' },
          zoom: { wheel: { enabled: true }, pinch: { enabled: true }, mode: 'x' }
        }
      },
      scales
    }
  });

  window.wbChart = wbChart;
  wbHighlightPoint(wbDateIndex);
}

/* ================================================================
 *  Internal – stats panel
 * ================================================================ */
function wbSetText (id, text) {
  const el = wbEl(id);
  if (el) el.textContent = text;
}

function wbUpdateStats () {
  const statWb = wbEl('wb-stats');

  if (!wbCombo) {
    ['stat-basins','stat-years','stat-max-val','stat-min-val','stat-mean-val']
      .forEach(id => wbSetText(id, '—'));
    ['stat-max-date','stat-min-date'].forEach(id => wbSetText(id, ''));
    wbSetText('selectedBasins', WB_T.none);
    if (statWb) statWb.innerHTML = '';
    return;
  }

  const dates = wbCombo.dates;
  const ids   = wbActiveBasinId ? [wbActiveBasinId] : Object.keys(wbCombo.basins);

  wbSetText('stat-basins', ids.length);
  wbSetText('stat-years',  Math.round(dates.length / 12));
  wbSetText('selectedBasins', wbActiveBasinId
    ? `${window.wbBasinName(wbActiveBasinId)} (${wbActiveBasinId})`
    : WB_T.allBasins);

  // Max / min / mean of the map metric over the selected basin(s)
  const points = [];
  ids.forEach(id => {
    (wbCombo.basins[id][wbMetric] || []).forEach((v, i) => {
      if (Number.isFinite(v)) points.push({ v, date: dates[i], name: wbCombo.basins[id].name });
    });
  });

  if (points.length) {
    const maxPt = points.reduce((a, b) => b.v > a.v ? b : a);
    const minPt = points.reduce((a, b) => b.v < a.v ? b : a);
    const mean  = points.reduce((s, p) => s + p.v, 0) / points.length;
    const label = WB_VAR[wbMetric].short;
    wbSetText('stat-max-val',  `${label}: ${maxPt.v.toFixed(2)} mm`);
    wbSetText('stat-max-date', `${maxPt.date}  ·  ${maxPt.name}`);
    wbSetText('stat-min-val',  `${label}: ${minPt.v.toFixed(2)} mm`);
    wbSetText('stat-min-date', `${minPt.date}  ·  ${minPt.name}`);
    wbSetText('stat-mean-val', `${label}: ${mean.toFixed(2)} mm`);
  }

  if (!statWb) return;

  // P/E/Q end earlier than GRACE, so report both periods
  const pDates = dates.filter((_, i) => ids.some(id => Number.isFinite(wbCombo.basins[id].P[i])));
  const period = `P/E/Q ${wbPeriod(pDates)} · GRACE ${wbPeriod(dates)}`;

  if (!wbActiveBasinId) {
    statWb.innerHTML = `<div style="font-size:0.7rem;color:#8a96a8;margin-top:4px;">${period}</div>`;
    return;
  }

  const basin = wbCombo.basins[wbActiveBasinId];
  const mean = key => {
    const vals = basin[key].filter(Number.isFinite);
    return vals.length ? (vals.reduce((a, b) => a + b, 0) / vals.length).toFixed(1) : '—';
  };

  statWb.innerHTML = `
    <table style="width:100%;font-size:0.75rem;border-collapse:collapse;margin-top:6px;">
      <thead>
        <tr style="background:#f0f3f8;">
          <th style="padding:3px 5px;text-align:left;">${WB_T.variable}</th>
          <th style="padding:3px 5px;text-align:right;">${WB_T.mean}</th>
        </tr>
      </thead>
      <tbody>
        ${WB_VAR_CONFIG.map(cfg => `
          <tr>
            <td style="padding:2px 5px;">
              <span style="display:inline-block;width:10px;height:10px;
                           border-radius:2px;background:${cfg.color};
                           margin-right:4px;vertical-align:middle;"></span>
              ${cfg.short}
            </td>
            <td style="padding:2px 5px;text-align:right;font-weight:600;">${mean(cfg.key)}</td>
          </tr>
        `).join('')}
      </tbody>
    </table>
    <div style="font-size:0.7rem;color:#8a96a8;margin-top:4px;">${period}</div>
  `;
}

/* ================================================================
 *  Event wiring (DOM is ready — scripts load after HTML)
 * ================================================================ */

/* P / E / Q product selectors */
Object.values(WB_PRODUCT_SELECTS).forEach(id => {
  wbEl(id)?.addEventListener('change', () => { if (wbIndex) wbLoadCombo(); });
});

/* Variable toggle checkboxes (single-basin chart) */
WB_VAR_CONFIG.forEach(cfg => {
  wbEl(`wbShow_${cfg.key}`)?.addEventListener('change', () => {
    if (wbActiveBasinId) wbDrawChart();
  });
});

/* ================================================================
 *  CSV export
 * ================================================================ */
window.prepareWBCSV = function (link) {
  if (!wbCombo) return;
  const ids  = wbActiveBasinId ? [wbActiveBasinId] : Object.keys(wbCombo.basins);
  const vars = WB_VAR_CONFIG.map(c => c.key);
  const cell = v => (Number.isFinite(v) ? v : '');

  const rows = [];
  ids.forEach(id => {
    const b = wbCombo.basins[id];
    wbCombo.dates.forEach((d, i) => {
      rows.push([id, `"${b.name}"`, d, ...vars.map(k => cell(b[k][i]))].join(','));
    });
  });

  const csv = [
    `# Combination: ${wbCombo.label}`,
    `# Period: ${wbPeriod(wbCombo.dates)} (date = first day of month)`,
    `# Units: mm/month`,
    ['basin_id', 'basin_name', 'date', ...vars].join(','),
    ...rows
  ].join('\n');

  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const name = wbActiveBasinId ? wbCombo.basins[wbActiveBasinId].name.toLowerCase().replace(/\W+/g, '_') : wbLayerKey;
  link.href = URL.createObjectURL(blob);
  link.download = `${name}_${wbCombo.key}.csv`;
};
