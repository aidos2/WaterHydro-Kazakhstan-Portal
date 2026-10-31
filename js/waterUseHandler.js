/* ================================================================
 *  waterUseHandler.js – Water Use & Abstraction dashboard
 *
 *  Data: input_data/water_use/water_use_dashboard.json, produced by
 *  notebooks/water_use_dashboard.ipynb (the source of all numbers).
 *  Boundaries: input_data/Water management basins.geojson (BASIN_ID).
 *  Language comes from <html lang="en|ru|kk">.
 * ================================================================ */

const WU_DATA_URL = 'input_data/water_use/water_use_dashboard.json';
const WU_GEO_URL  = 'input_data/Water management basins.geojson';

/* ---- UI strings ------------------------------------------------ */
const WU_I18N = {
  en: {
    allBasins: 'All 5 basins', allSectors: 'All sectors', noData: 'No statistics',
    pp: 'p.p.', unit: 'mln m³', perYear: 'mln m³/yr', vsFirst: 'vs {y}', share: 'of 5-basin total',
    play: '▶ Play', pause: '❚❚ Pause', reset: 'Show all basins',
    efficiency: 'Efficiency', lossRate: 'Loss rate',
    ind: { W: 'Total withdrawal', U: 'Water used', D: 'Total discharge', DWB: 'Discharge to water bodies',
           NR: 'Non-returnable consumption', TL: 'Transport losses', EFF: 'Water-use efficiency (used ÷ withdrawn)',
           LOSS: 'Loss rate (losses ÷ withdrawn)' },
    src: { fresh: 'Surface (fresh)', SEA: 'Sea water', UND: 'Groundwater & mine', COL: 'Collector-drainage', WW: 'Wastewater' },
    kpi: { W: 'Withdrawal', U: 'Water used', EFF: 'Efficiency', TL: 'Transport losses' },
    tsTitleAll: '{ind} by basin, {y0}–{y1}', tsTitleBasin: '{ind} by sector — {basin}, {y0}–{y1}',
    tsTitleType: '{ind} by water-use type — {basin}, {y0}–{y1}',
    srcTitle: 'Water intake by source — {basin}', effTitle: 'Efficiency and loss rate — {basin}',
    mixTitle: 'Structure in {year} — {basin}', matrixTitle: '{ind} — basin × year',
    topTypes: 'Largest water-use types', mapTitle: '{ind} — {year}', clickHint: 'Click a basin to filter the dashboard',
    csvName: 'water_use', basinCol: 'Basin', yearCol: 'Year',
  },
  ru: {
    allBasins: 'Все 5 бассейнов', allSectors: 'Все отрасли', noData: 'Нет статистики',
    pp: 'п.п.', unit: 'млн м³', perYear: 'млн м³/год', vsFirst: 'к {y} г.', share: 'от суммы 5 бассейнов',
    play: '▶ Воспр.', pause: '❚❚ Пауза', reset: 'Показать все бассейны',
    efficiency: 'Эффективность', lossRate: 'Доля потерь',
    ind: { W: 'Общий водозабор', U: 'Использовано воды', D: 'Общий сброс', DWB: 'Сброс в водные объекты',
           NR: 'Безвозвратное водопотребление', TL: 'Потери при транспортировке',
           EFF: 'Эффективность водопользования (использовано ÷ забрано)', LOSS: 'Доля потерь (потери ÷ забрано)' },
    src: { fresh: 'Поверхностные (пресные)', SEA: 'Морская вода', UND: 'Подземные и шахтные', COL: 'Коллекторно-дренажные', WW: 'Сточные воды' },
    kpi: { W: 'Водозабор', U: 'Использовано', EFF: 'Эффективность', TL: 'Потери' },
    tsTitleAll: '{ind} по бассейнам, {y0}–{y1}', tsTitleBasin: '{ind} по отраслям — {basin}, {y0}–{y1}',
    tsTitleType: '{ind} по видам водопользования — {basin}, {y0}–{y1}',
    srcTitle: 'Водозабор по источникам — {basin}', effTitle: 'Эффективность и доля потерь — {basin}',
    mixTitle: 'Структура в {year} г. — {basin}', matrixTitle: '{ind} — бассейн × год',
    topTypes: 'Крупнейшие виды водопользования', mapTitle: '{ind} — {year}', clickHint: 'Нажмите на бассейн, чтобы отфильтровать дашборд',
    csvName: 'vodopolzovanie', basinCol: 'Бассейн', yearCol: 'Год',
  },
  kk: {
    allBasins: 'Барлық 5 алап', allSectors: 'Барлық салалар', noData: 'Статистика жоқ',
    pp: 'п.т.', unit: 'млн м³', perYear: 'млн м³/жыл', vsFirst: '{y} жылмен салыстырғанда', share: '5 алап жиынтығынан',
    play: '▶ Ойнату', pause: '❚❚ Кідірту', reset: 'Барлық алаптарды көрсету',
    efficiency: 'Тиімділік', lossRate: 'Шығын үлесі',
    ind: { W: 'Жалпы су алу', U: 'Пайдаланылған су', D: 'Жалпы су ағызу', DWB: 'Су объектілеріне ағызу',
           NR: 'Қайтарымсыз су тұтыну', TL: 'Тасымалдау кезіндегі шығындар',
           EFF: 'Су пайдалану тиімділігі (пайдаланылған ÷ алынған)', LOSS: 'Шығын үлесі (шығын ÷ алынған)' },
    src: { fresh: 'Жерүсті сулары (тұщы)', SEA: 'Теңіз суы', UND: 'Жерасты және шахта сулары', COL: 'Коллекторлық-дренаждық сулар', WW: 'Сарқынды сулар' },
    kpi: { W: 'Су алу', U: 'Пайдаланылды', EFF: 'Тиімділік', TL: 'Шығындар' },
    tsTitleAll: '{ind} алаптар бойынша, {y0}–{y1}', tsTitleBasin: '{ind} салалар бойынша — {basin}, {y0}–{y1}',
    tsTitleType: '{ind} су пайдалану түрлері бойынша — {basin}, {y0}–{y1}',
    srcTitle: 'Көздер бойынша су алу — {basin}', effTitle: 'Тиімділік және шығын үлесі — {basin}',
    mixTitle: '{year} ж. құрылымы — {basin}', matrixTitle: '{ind} — алап × жыл',
    topTypes: 'Ең ірі су пайдалану түрлері', mapTitle: '{ind} — {year}', clickHint: 'Дашбордты сүзу үшін алапты басыңыз',
    csvName: 'su_paidalanu', basinCol: 'Алап', yearCol: 'Жыл',
  },
};
/* Names of WMB-layer basins that have no statistics */
const WU_NODATA_NAMES = {
  WMB_00002: { en: 'Aral-Syr Darya',  ru: 'Арал-Сырдарья',   kk: 'Арал-Сырдария' },
  WMB_00003: { en: 'Shu-Talas',       ru: 'Шу-Талас',        kk: 'Шу-Талас' },
  WMB_00007: { en: 'Balkhash-Alakol', ru: 'Балхаш-Алаколь',  kk: 'Балқаш-Алакөл' },
};
const WU_BASIN_COLORS = ['#0e1c36', '#1a7f6e', '#c9a84c', '#3182bd', '#cb4b16'];
const WU_SRC_COLORS   = { fresh: '#3182bd', SEA: '#1a7f6e', UND: '#8c6d31', COL: '#969696', WW: '#cb4b16' };
const WU_RAMP         = ['#eff3ff', '#bdd7e7', '#6baed6', '#3182bd', '#08519c'];
const WU_RATIO        = { EFF: ['U', 'W'], LOSS: ['TL', 'W'] };   // derived % indicators: [numerator, denominator]

const WU_LANG = (document.documentElement.lang || 'en').slice(0, 2) === 'ru' ? 'ru'
              : (document.documentElement.lang || '').startsWith('k') ? 'kk' : 'en';
const T   = WU_I18N[WU_LANG];
const LBL = WU_LANG === 'kk' ? 'kz' : WU_LANG;                    // label key inside the JSON
const fmt = (s, o) => s.replace(/\{(\w+)\}/g, (_, k) => o[k] ?? '');
const wuEl = id => document.getElementById(id);

/* ---- State ----------------------------------------------------- */
const WU = {
  data: null, years: [], basins: [], sectors: [], types: [],
  indicator: 'W', sector: 'all', basin: null, yearIdx: 0,
  charts: {}, map: null, layer: null, playTimer: null,
};

/* ================================================================
 *  Data access
 * ================================================================ */

/** Water-use type keys included by the current sector filter */
function wuTypeKeys (sector = WU.sector) {
  return WU.types.filter(t => sector === 'all' || t.sector === sector).map(t => t.key);
}

/** Sum of one raw column over basins × types → array over years */
function wuSum (col, basinIds, typeKeys) {
  const out = new Array(WU.years.length).fill(0);
  basinIds.forEach(b => typeKeys.forEach(t => {
    const arr = WU.data[b]?.[t]?.[col];
    if (arr) arr.forEach((v, i) => { out[i] += v; });
  }));
  return out;
}

/** Indicator series (volume or %) over years */
function wuSeries (ind, basinIds, typeKeys) {
  if (WU_RATIO[ind]) {
    const [n, d] = WU_RATIO[ind];
    const num = wuSum(n, basinIds, typeKeys), den = wuSum(d, basinIds, typeKeys);
    return num.map((v, i) => (den[i] > 0 ? 100 * v / den[i] : null));
  }
  return wuSum(ind, basinIds, typeKeys);
}

const wuAllIds     = () => WU.basins.map(b => b.id);
const wuSelIds     = () => (WU.basin ? [WU.basin] : wuAllIds());
const wuBasinName  = id => WU.basins.find(b => b.id === id)?.[LBL] || WU_NODATA_NAMES[id]?.[WU_LANG] || id;
const wuSelName    = () => (WU.basin ? wuBasinName(WU.basin) : T.allBasins);
const wuIsRatio    = ind => Boolean(WU_RATIO[ind]);
const wuUnit       = ind => (wuIsRatio(ind) ? '%' : T.unit);
/** Indicator name, qualified by the sector filter so titles match the values shown */
const wuIndLabel   = ind => (WU.sector === 'all' ? T.ind[ind]
                             : `${T.ind[ind]} · ${WU.sectors.find(s => s.key === WU.sector)[LBL]}`);

function wuNum (v, ind = 'W') {
  if (v == null || !Number.isFinite(v)) return '—';
  if (v === 0) return '0';
  const digits = wuIsRatio(ind) ? 1 : Math.abs(v) >= 100 ? 0 : Math.abs(v) >= 10 ? 1 : 2;
  return v.toLocaleString(WU_LANG === 'en' ? 'en-US' : 'ru-RU', { minimumFractionDigits: digits, maximumFractionDigits: digits });
}

/* ================================================================
 *  Map
 * ================================================================ */
function wuInitMap () {
  WU.layer = new ol.layer.Vector({
    source: new ol.source.Vector({ url: WU_GEO_URL, format: new ol.format.GeoJSON() }),
    style: wuFeatureStyle,
  });
  WU.map = new ol.Map({
    target: 'wu-map',
    layers: [new ol.layer.Tile({ source: new ol.source.OSM() }), WU.layer],
    view: new ol.View({ center: ol.proj.fromLonLat([67, 48]), zoom: 4.3 }),
  });
  WU.layer.getSource().once('change', e => {
    if (e.target.getState() === 'ready') {
      WU.map.getView().fit(e.target.getExtent(), { padding: [20, 20, 20, 20] });
    }
  });

  const tip = wuEl('wu-hover');
  WU.map.on('pointermove', evt => {
    const f = WU.map.forEachFeatureAtPixel(evt.pixel, x => x);
    WU.map.getTargetElement().style.cursor = f && WU.data[f.get('BASIN_ID')] ? 'pointer' : '';
    if (!f) { tip.hidden = true; return; }
    const id = f.get('BASIN_ID');
    const v = WU.data[id] ? wuSeries(WU.indicator, [id], wuTypeKeys())[WU.yearIdx] : null;
    tip.innerHTML = `<strong>${wuBasinName(id)}</strong><br>` +
      (WU.data[id] ? `${wuNum(v, WU.indicator)} ${wuUnit(WU.indicator)}` : `<em>${T.noData}</em>`);
    tip.hidden = false;
  });
  WU.map.getViewport().addEventListener('mouseleave', () => { tip.hidden = true; });
  WU.map.on('singleclick', evt => {
    const f = WU.map.forEachFeatureAtPixel(evt.pixel, x => x);
    const id = f?.get('BASIN_ID');
    if (id && WU.data[id]) wuSetBasin(WU.basin === id ? null : id);
  });
}

/** Colour scale range for the current indicator/sector across all years and basins */
function wuMapRange () {
  let lo = Infinity, hi = -Infinity;
  wuAllIds().forEach(id => wuSeries(WU.indicator, [id], wuTypeKeys()).forEach(v => {
    if (v != null) { lo = Math.min(lo, v); hi = Math.max(hi, v); }
  }));
  if (!Number.isFinite(lo)) return [0, 1];
  return wuIsRatio(WU.indicator) ? [lo, hi] : [0, hi || 1];
}

function wuRampColor (t) {
  t = Math.max(0, Math.min(1, t));
  const pos = t * (WU_RAMP.length - 1), i = Math.min(Math.floor(pos), WU_RAMP.length - 2), f = pos - i;
  const a = WU_RAMP[i].match(/\w\w/g).map(h => parseInt(h, 16));
  const b = WU_RAMP[i + 1].match(/\w\w/g).map(h => parseInt(h, 16));
  return `rgb(${a.map((c, k) => Math.round(c + (b[k] - c) * f)).join(',')})`;
}

const WU_HATCH = (() => {
  const c = document.createElement('canvas'); c.width = c.height = 8;
  const g = c.getContext('2d'); g.fillStyle = '#f2f2f2'; g.fillRect(0, 0, 8, 8);
  g.strokeStyle = 'rgba(120,120,120,0.55)'; g.lineWidth = 1.5;
  g.beginPath(); g.moveTo(-2, 2); g.lineTo(10, 14); g.moveTo(-2, -6); g.lineTo(10, 6); g.stroke();
  return g.createPattern(c, 'repeat');
})();

function wuFeatureStyle (feat) {
  const id = feat.get('BASIN_ID');
  if (!WU.data || !WU.data[id]) {
    return new ol.style.Style({ fill: new ol.style.Fill({ color: WU_HATCH }),
                                stroke: new ol.style.Stroke({ color: '#aaa', width: 0.8 }) });
  }
  const [lo, hi] = WU.range || [0, 1];
  const v = wuSeries(WU.indicator, [id], wuTypeKeys())[WU.yearIdx];
  const sel = WU.basin === id;
  return [
    new ol.style.Style({
      fill:   new ol.style.Fill({ color: v == null ? WU_HATCH : wuRampColor((v - lo) / (hi - lo || 1)) }),
      stroke: new ol.style.Stroke({ color: sel ? '#c9a84c' : '#0e1c36', width: sel ? 4 : 1.2 }),
    }),
    // one label per basin, placed in its largest part (MultiPolygons would otherwise repeat it)
    new ol.style.Style({
      geometry: wuLabelPoint,
      text: new ol.style.Text({
        text: `${wuBasinName(id)}\n${wuNum(v, WU.indicator)}`,
        font: `${sel ? 'bold ' : ''}12px Roboto, Arial, sans-serif`, overflow: true,
        fill: new ol.style.Fill({ color: '#0e1c36' }), stroke: new ol.style.Stroke({ color: '#fff', width: 3 }),
      }),
    }),
  ];
}

function wuLabelPoint (feat) {
  const g = feat.getGeometry();
  if (g.getType() !== 'MultiPolygon') return g.getInteriorPoint();
  const largest = g.getPolygons().reduce((a, b) => (b.getArea() > a.getArea() ? b : a));
  return largest.getInteriorPoint();
}

function wuRenderMap () {
  WU.range = wuMapRange();
  WU.layer.changed();
  const [lo, hi] = WU.range;
  wuEl('wu-map-title').textContent = fmt(T.mapTitle, { ind: wuIndLabel(WU.indicator), year: WU.years[WU.yearIdx] });
  wuEl('wu-legend').innerHTML = `
    <div class="wu-legend-title">${wuIndLabel(WU.indicator)}, ${wuUnit(WU.indicator)}</div>
    <div class="wu-legend-bar" style="background:linear-gradient(90deg,${WU_RAMP.join(',')})"></div>
    <div class="wu-legend-scale"><span>${wuNum(lo, WU.indicator)}</span><span>${wuNum(hi, WU.indicator)}</span></div>
    <div class="wu-legend-nd"><span class="wu-swatch-nd"></span>${T.noData}</div>`;
}

/* ================================================================
 *  KPI tiles
 * ================================================================ */
function wuRenderKpis () {
  const ids = wuSelIds(), types = wuTypeKeys(), i = WU.yearIdx, y0 = WU.years[0];
  wuEl('wu-kpis').innerHTML = ['W', 'U', 'EFF', 'TL'].map(k => {
    const s = wuSeries(k, ids, types);
    const v = s[i], base = s[0];
    let delta = '';
    if (i > 0 && v != null && base != null) {
      const d = wuIsRatio(k) ? v - base : (base > 0 ? 100 * (v / base - 1) : null);
      if (d != null) {
        const unit = wuIsRatio(k) ? ` ${T.pp}` : ' %';
        // colour by meaning: higher efficiency / lower losses is good; volumes are neutral
        const tone = k === 'EFF' ? (d >= 0 ? 'good' : 'bad') : k === 'TL' ? (d <= 0 ? 'good' : 'bad') : 'neutral';
        delta = `<span class="${tone}">${d >= 0 ? '▲' : '▼'} ${wuNum(Math.abs(d), 'EFF')}${unit}</span> ${fmt(T.vsFirst, { y: y0 })}`;
      }
    }
    let share = '';
    if (!wuIsRatio(k) && WU.basin) {
      const tot = wuSeries(k, wuAllIds(), types)[i];
      if (tot > 0) share = `<div class="wu-kpi-share">${wuNum(100 * v / tot, 'EFF')} % ${T.share}</div>`;
    }
    return `<div class="wu-kpi">
      <div class="wu-kpi-label">${T.kpi[k]}</div>
      <div class="wu-kpi-value">${wuNum(v, k)} <small>${wuUnit(k)}</small></div>
      <div class="wu-kpi-delta">${delta}</div>${share}
    </div>`;
  }).join('');
}

/* ================================================================
 *  Charts
 * ================================================================ */
Chart.defaults.font.family = "'Roboto', Arial, sans-serif";
Chart.defaults.font.size = 11;
Chart.defaults.color = '#3b4658';

/* Highlights the selected year as a gold band */
const wuYearBand = {
  id: 'wuYearBand',
  beforeDatasetsDraw (chart) {
    const x = chart.scales.x;
    if (!x || chart.config.type === 'doughnut') return;
    const px = x.getPixelForValue(WU.yearIdx);
    const w = Math.abs(x.getPixelForValue(1) - x.getPixelForValue(0)) * 0.9;
    const { left, right, top, bottom } = chart.chartArea, ctx = chart.ctx;
    ctx.save();
    ctx.beginPath(); ctx.rect(left, top, right - left, bottom - top); ctx.clip();
    ctx.fillStyle = 'rgba(201,168,76,0.18)';
    ctx.fillRect(px - w / 2, top, w, bottom - top);
    ctx.restore();
  },
};

function wuChart (key, canvasId, config) {
  if (WU.charts[key]) WU.charts[key].destroy();
  const empty = !config.data.datasets.some(d => d.data.some(v => v != null && v !== 0));
  wuEl(canvasId).parentElement.dataset.empty = empty ? T.noData : '';
  config.options = config.options || {};
  if (config.type !== 'doughnut') {
    config.plugins = [wuYearBand];
    config.options.onClick = (evt, els, chart) => {
      const idx = chart.scales.x.getValueForPixel(evt.x);
      if (Number.isInteger(idx) && idx >= 0 && idx < WU.years.length) wuSetYear(idx);
    };
  }
  WU.charts[key] = new Chart(wuEl(canvasId), config);
}

const wuTooltip = ind => ({
  callbacks: { label: c => `${c.dataset.label}: ${wuNum(c.raw, ind)} ${wuUnit(ind)}` },
});

/** Main time series: by basin (all) / by sector (one basin) / by type (one basin + sector) */
function wuRenderTimeSeries () {
  const ind = WU.indicator, ratio = wuIsRatio(ind);
  const y = { y0: WU.years[0], y1: WU.years[WU.years.length - 1], ind: wuIndLabel(ind), basin: wuSelName() };
  let groups, title;
  if (!WU.basin || ratio) {
    groups = WU.basins.map((b, i) => ({ label: b[LBL], color: WU_BASIN_COLORS[i], ids: [b.id], types: wuTypeKeys() }));
    title = fmt(T.tsTitleAll, y);
  } else if (WU.sector === 'all') {
    groups = WU.sectors.map(s => ({ label: s[LBL], color: s.color, ids: [WU.basin], types: wuTypeKeys(s.key) }));
    title = fmt(T.tsTitleBasin, y);
  } else {
    const shades = ['#0e1c36', '#3182bd', '#1a7f6e', '#c9a84c', '#cb4b16'];
    groups = WU.types.filter(t => t.sector === WU.sector)
      .map((t, i) => ({ label: t[LBL], color: shades[i % shades.length], ids: [WU.basin], types: [t.key] }));
    title = fmt(T.tsTitleType, y);
  }
  const datasets = groups.map(g => {
    const data = wuSeries(ind, g.ids, g.types);
    return { label: g.label, data, backgroundColor: g.color, borderColor: g.color,
             borderWidth: ratio ? 2 : 0, pointRadius: ratio ? 2 : 0, tension: 0.2, fill: false,
             hidden: !ratio && data.every(v => !v) };
  }).filter(d => !(d.hidden && !ratio));
  if (ratio && WU.basin) datasets.forEach(d => { if (d.label !== wuSelName()) { d.borderColor += '40'; d.backgroundColor += '40'; } });

  wuEl('wu-ts-title').textContent = title;
  wuChart('ts', 'wu-ts', {
    type: ratio ? 'line' : 'bar',
    data: { labels: WU.years, datasets },
    options: {
      responsive: true, maintainAspectRatio: false, interaction: { mode: 'index', intersect: false },
      plugins: { legend: { position: 'bottom', labels: { boxWidth: 12, padding: 10 } }, tooltip: wuTooltip(ind) },
      scales: { x: { stacked: !ratio, grid: { display: false } },
                y: { stacked: !ratio, title: { display: true, text: wuUnit(ind) }, beginAtZero: !ratio } },
    },
  });
}

/** Sector (or type) structure for the selected year */
function wuRenderMix () {
  const ids = wuSelIds(), i = WU.yearIdx, ind = wuIsRatio(WU.indicator) ? 'W' : WU.indicator;
  const byType = WU.sector !== 'all';
  const parts = (byType ? WU.types.filter(t => t.sector === WU.sector).map((t, k) => ({
      label: t[LBL], color: ['#0e1c36', '#3182bd', '#1a7f6e', '#c9a84c', '#cb4b16'][k % 5], types: [t.key] }))
    : WU.sectors.map(s => ({ label: s[LBL], color: s.color, types: wuTypeKeys(s.key) })))
    .map(p => ({ ...p, v: wuSeries(ind, ids, p.types)[i] }))
    .filter(p => p.v > 0).sort((a, b) => b.v - a.v);

  wuEl('wu-mix-title').textContent = fmt(T.mixTitle, { year: WU.years[i], basin: wuSelName() });
  wuChart('mix', 'wu-mix', {
    type: 'doughnut',
    data: { labels: parts.map(p => p.label),
            datasets: [{ data: parts.map(p => p.v), backgroundColor: parts.map(p => p.color), borderWidth: 1 }] },
    options: {
      responsive: true, maintainAspectRatio: false, cutout: '58%',
      plugins: {
        legend: { position: 'right', labels: { boxWidth: 10, padding: 6, font: { size: 10 } } },
        tooltip: { callbacks: { label: c => {
          const tot = c.dataset.data.reduce((a, b) => a + b, 0);
          return `${c.label}: ${wuNum(c.raw, ind)} ${T.unit} (${wuNum(100 * c.raw / tot, 'EFF')} %)`;
        } } },
      },
    },
  });

  // Top water-use types list
  const types = wuTypeKeys().map(k => ({ t: WU.types.find(x => x.key === k), v: wuSeries(ind, ids, [k])[i] }))
    .filter(x => x.v > 0).sort((a, b) => b.v - a.v).slice(0, 6);
  const tot = wuSeries(ind, ids, wuTypeKeys())[i] || 1;
  wuEl('wu-top-title').textContent = `${T.topTypes} — ${T.ind[ind]}`;
  wuEl('wu-top').innerHTML = types.map(x => `
    <div class="wu-top-row">
      <span class="wu-top-name" title="${x.t.source_name}">${x.t[LBL]}</span>
      <span class="wu-top-bar"><span style="width:${(100 * x.v / tot).toFixed(1)}%"></span></span>
      <span class="wu-top-val">${wuNum(x.v, ind)}</span>
    </div>`).join('') || `<em>${T.noData}</em>`;
}

/** Intake by source (stacked) */
function wuRenderSources () {
  const ids = wuSelIds(), types = wuTypeKeys();
  const sur = wuSum('SUR', ids, types), sea = wuSum('SEA', ids, types);
  const parts = { fresh: sur.map((v, i) => Math.max(0, v - sea[i])), SEA: sea,
                  UND: wuSum('UND', ids, types), COL: wuSum('COL', ids, types), WW: wuSum('WW', ids, types) };
  wuEl('wu-src-title').textContent = fmt(T.srcTitle, { basin: wuSelName() });
  wuChart('src', 'wu-src', {
    type: 'bar',
    data: { labels: WU.years, datasets: Object.entries(parts).filter(([, d]) => d.some(v => v > 0))
      .map(([k, d]) => ({ label: T.src[k], data: d, backgroundColor: WU_SRC_COLORS[k] })) },
    options: {
      responsive: true, maintainAspectRatio: false, interaction: { mode: 'index', intersect: false },
      plugins: { legend: { position: 'bottom', labels: { boxWidth: 12 } }, tooltip: wuTooltip('W') },
      scales: { x: { stacked: true, grid: { display: false } }, y: { stacked: true, title: { display: true, text: T.unit } } },
    },
  });
}

/** Efficiency and loss rate (%) */
function wuRenderEfficiency () {
  const ids = wuSelIds(), types = wuTypeKeys();
  wuEl('wu-eff-title').textContent = fmt(T.effTitle, { basin: wuSelName() });
  wuChart('eff', 'wu-eff', {
    type: 'line',
    data: { labels: WU.years, datasets: [
      { label: `${T.efficiency}, %`, data: wuSeries('EFF', ids, types), borderColor: '#1a7f6e',
        backgroundColor: '#1a7f6e', yAxisID: 'y', tension: 0.2, pointRadius: 2 },
      { label: `${T.lossRate}, %`, data: wuSeries('LOSS', ids, types), borderColor: '#cb4b16',
        backgroundColor: '#cb4b16', yAxisID: 'y1', borderDash: [5, 3], tension: 0.2, pointRadius: 2 },
    ] },
    options: {
      responsive: true, maintainAspectRatio: false, interaction: { mode: 'index', intersect: false },
      plugins: { legend: { position: 'bottom', labels: { boxWidth: 12 } }, tooltip: wuTooltip('EFF') },
      scales: {
        x: { grid: { display: false } },
        y:  { position: 'left',  title: { display: true, text: `${T.efficiency}, %` } },
        y1: { position: 'right', title: { display: true, text: `${T.lossRate}, %` }, grid: { drawOnChartArea: false }, beginAtZero: true },
      },
    },
  });
}

/** Basin × year matrix (click a cell to select) */
function wuRenderMatrix () {
  const ind = WU.indicator, types = wuTypeKeys();
  const rows = WU.basins.map(b => ({ b, s: wuSeries(ind, [b.id], types) }));
  const [lo, hi] = WU.range;
  wuEl('wu-matrix-title').textContent = fmt(T.matrixTitle, { ind: `${wuIndLabel(ind)}, ${wuUnit(ind)}` });
  wuEl('wu-matrix').innerHTML = `
    <table class="wu-matrix">
      <thead><tr><th>${T.basinCol}</th>${WU.years.map((y, i) =>
        `<th class="${i === WU.yearIdx ? 'sel' : ''}" data-y="${i}">${String(y).slice(2)}</th>`).join('')}</tr></thead>
      <tbody>${rows.map(({ b, s }) => `<tr class="${WU.basin === b.id ? 'sel' : ''}">
        <th data-b="${b.id}">${b[LBL]}</th>${s.map((v, i) => {
          const t = v == null ? 0 : (v - lo) / (hi - lo || 1);
          return `<td data-b="${b.id}" data-y="${i}" class="${i === WU.yearIdx ? 'sel' : ''}"
                     style="background:${v == null ? '#f2f2f2' : wuRampColor(t)};color:${t > 0.55 ? '#fff' : '#0e1c36'}"
                     title="${b[LBL]} · ${WU.years[i]}: ${wuNum(v, ind)} ${wuUnit(ind)}">${wuNum(v, ind)}</td>`;
        }).join('')}</tr>`).join('')}</tbody>
    </table>`;
}

/* ================================================================
 *  Render / state changes
 * ================================================================ */
function wuRender () {
  wuEl('wu-year').textContent = WU.years[WU.yearIdx];
  wuEl('wu-slider').value = WU.yearIdx;
  wuEl('wu-slider').setAttribute('aria-valuetext', WU.years[WU.yearIdx]);
  wuEl('wu-basin').value = WU.basin || 'all';
  wuEl('wu-reset').disabled = !WU.basin;
  wuRenderMap();
  wuRenderKpis();
  wuRenderTimeSeries();
  wuRenderMix();
  wuRenderSources();
  wuRenderEfficiency();
  wuRenderMatrix();
}

/* Year change only needs the year-dependent parts (keeps playback smooth) */
function wuSetYear (idx) {
  WU.yearIdx = idx;
  wuEl('wu-year').textContent = WU.years[idx];
  wuEl('wu-slider').value = idx;
  wuEl('wu-slider').setAttribute('aria-valuetext', WU.years[idx]);
  wuRenderMap();
  wuRenderKpis();
  wuRenderMix();
  wuRenderMatrix();
  Object.values(WU.charts).forEach(c => c.config.type !== 'doughnut' && c.draw());
}

function wuSetBasin (id) {
  WU.basin = id;
  wuRender();
  const f = id && WU.layer.getSource().getFeatures().find(x => x.get('BASIN_ID') === id);
  if (f) WU.map.getView().fit(f.getGeometry(), { padding: [30, 30, 30, 30], duration: 300 });
  else if (!id) WU.map.getView().fit(WU.layer.getSource().getExtent(), { padding: [20, 20, 20, 20], duration: 300 });
}

function wuTogglePlay () {
  const btn = wuEl('wu-play');
  if (WU.playTimer) {
    clearInterval(WU.playTimer); WU.playTimer = null; btn.textContent = T.play; return;
  }
  if (WU.yearIdx >= WU.years.length - 1) wuSetYear(0);
  btn.textContent = T.pause;
  WU.playTimer = setInterval(() => {
    if (WU.yearIdx >= WU.years.length - 1) { wuTogglePlay(); return; }
    wuSetYear(WU.yearIdx + 1);
  }, 900);
}

/** CSV of the current main time series view */
function wuDownloadCSV () {
  const chart = WU.charts.ts;
  if (!chart) return;
  const ds = chart.data.datasets;
  const head = [T.yearCol, ...ds.map(d => `"${d.label.replace(/"/g, '""')}"`)].join(',');
  const rows = WU.years.map((y, i) => [y, ...ds.map(d => (d.data[i] == null ? '' : +d.data[i].toFixed(4)))].join(','));
  const sector = WU.sector === 'all' ? T.allSectors : WU.sectors.find(s => s.key === WU.sector)[LBL];
  const meta = [`# ${wuIndLabel(WU.indicator)} (${wuUnit(WU.indicator)})`, `# ${wuSelName()} · ${sector}`,
                `# Source: notebooks/water_use_dashboard.ipynb`];
  const blob = new Blob(['﻿' + [...meta, head, ...rows].join('\n')], { type: 'text/csv;charset=utf-8' });
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = `${T.csvName}_${WU.indicator}_${WU.basin || 'all'}_${WU.sector}.csv`;
  a.click();
  setTimeout(() => URL.revokeObjectURL(a.href), 1000);
}

/* ================================================================
 *  Init
 * ================================================================ */
fetch(WU_DATA_URL)
  .then(r => r.json())
  .then(json => {
    Object.assign(WU, { data: json.data, years: json.meta.years, basins: json.basins,
                        sectors: json.sectors, types: json.types, yearIdx: json.meta.years.length - 1 });

    wuEl('wu-indicator').innerHTML = ['W', 'U', 'D', 'DWB', 'NR', 'TL', 'EFF', 'LOSS']
      .map(k => `<option value="${k}">${T.ind[k]}</option>`).join('');
    wuEl('wu-sector').innerHTML = `<option value="all">${T.allSectors}</option>` +
      WU.sectors.filter(s => wuSum('W', wuAllIds(), wuTypeKeys(s.key)).some(v => v > 0))
        .map(s => `<option value="${s.key}">${s[LBL]}</option>`).join('');
    wuEl('wu-basin').innerHTML = `<option value="all">${T.allBasins}</option>` +
      WU.basins.map(b => `<option value="${b.id}">${b[LBL]}</option>`).join('');
    wuEl('wu-basin').addEventListener('change', e => wuSetBasin(e.target.value === 'all' ? null : e.target.value));
    const slider = wuEl('wu-slider');
    slider.min = 0; slider.max = WU.years.length - 1;
    wuEl('wu-y0').textContent = WU.years[0];
    wuEl('wu-y1').textContent = WU.years[WU.years.length - 1];
    wuEl('wu-play').textContent = T.play;
    wuEl('wu-reset').textContent = T.reset;
    wuEl('wu-click-hint').textContent = T.clickHint;

    wuEl('wu-indicator').addEventListener('change', e => { WU.indicator = e.target.value; wuRender(); });
    wuEl('wu-sector').addEventListener('change', e => { WU.sector = e.target.value; wuRender(); });
    slider.addEventListener('input', e => wuSetYear(+e.target.value));
    wuEl('wu-play').addEventListener('click', wuTogglePlay);
    wuEl('wu-reset').addEventListener('click', () => wuSetBasin(null));
    wuEl('wu-csv').addEventListener('click', e => { e.preventDefault(); wuDownloadCSV(); });
    wuEl('wu-matrix').addEventListener('click', e => {
      const cell = e.target.closest('[data-b],[data-y]');
      if (!cell) return;
      if (cell.dataset.y != null) WU.yearIdx = +cell.dataset.y;
      if (cell.dataset.b) wuSetBasin(cell.dataset.b); else wuSetYear(WU.yearIdx);
    });

    wuInitMap();
    wuRender();
  })
  .catch(err => {
    console.error('[waterUseHandler] load error:', err);
    wuEl('wu-ts-title').textContent = 'Could not load ' + WU_DATA_URL;
  });
