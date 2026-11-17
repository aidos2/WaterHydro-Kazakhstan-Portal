/* ================================================================
 *  storyMap.js – Story Map behaviour (story*.html)
 *  · sidecar: the card in view selects the media slide / map step
 *  · reading progress bar + chapter dots
 *  · map tour on the portal's own layers (OpenLayers, assets/ol)
 *  Language comes from <html lang="en|ru|kk">.
 * ================================================================ */

const SM_LANG = (() => {
  const l = (document.documentElement.lang || 'en').toLowerCase();
  return l.startsWith('ru') ? 'ru' : l.startsWith('k') ? 'kk' : 'en';
})();

/* Map labels per language (watersheds: WATERSHED_ID; hydro regions: HYDRO_REGI) */
const SM_NAMES = {
  NWB_00001: { en: 'Ertis', ru: 'Ертис (Иртыш)', kk: 'Ертіс' },
  NWB_00002: { en: 'Esil-Ertis closed', ru: 'Есиль-Иртышский бессточный', kk: 'Есіл-Ертіс тұйық' },
  NWB_00003: { en: 'Nura', ru: 'Нура', kk: 'Нұра' },
  NWB_00004: { en: 'Ob-Ertis closed', ru: 'Обь-Иртышский бессточный', kk: 'Об-Ертіс тұйық' },
  NWB_00005: { en: 'Sarysu', ru: 'Сарысу', kk: 'Сарысу' },
  NWB_00006: { en: 'Tobyl', ru: 'Тобол', kk: 'Тобыл' },
  NWB_00007: { en: 'Torgai', ru: 'Торгай', kk: 'Торғай' },
  NWB_00008: { en: 'Vagay', ru: 'Вагай', kk: 'Вагай' },
  NWB_00009: { en: 'Yesil', ru: 'Есиль', kk: 'Есіл' },
  NWB_00010: { en: 'Zhaiyk-Caspian', ru: 'Жайык-Каспий', kk: 'Жайық-Каспий' },
  SWB_00001: { en: 'Syr Darya-Aral', ru: 'Сырдарья-Арал', kk: 'Сырдария-Арал' },
  SWB_00002: { en: 'Ily-Balkhash-Alakol', ru: 'Иле-Балхаш-Алаколь', kk: 'Іле-Балқаш-Алакөл' },
  SWB_00003: { en: 'Shu-Talas', ru: 'Шу-Талас', kk: 'Шу-Талас' },
  SWB_00004: { en: 'Amu Darya-Aral', ru: 'Амударья-Арал', kk: 'Әмудария-Арал' },
  WMB_00001: { en: 'Tobyl-Torgai', ru: 'Тобол-Торгай', kk: 'Тобыл-Торғай' },
  WMB_00004: { en: 'Nura-Sarysu', ru: 'Нура-Сарысу', kk: 'Нұра-Сарысу' },
  WMB_00005: { en: 'Yesil', ru: 'Есиль', kk: 'Есіл' },
  WMB_00006: { en: 'Ertis', ru: 'Ертис (Иртыш)', kk: 'Ертіс' },
  WMB_00008: { en: 'Zhaiyk-Caspian', ru: 'Жайык-Каспий', kk: 'Жайық-Каспий' },
};
const SM_LEGEND = {
  en: { north: 'North hydrological region', south: 'South hydrological region', rivers: 'Rivers', lakes: 'Lakes',
        watersheds: 'Watersheds (14)', wb: 'Water balance products · 14 basins', wmb: 'Water-use statistics · 5 basins',
        wmbOther: 'Other water management basins',
        lulc: ['Trees', 'Shrubland', 'Grassland', 'Cropland', 'Built-up', 'Bare / sparse vegetation',
               'Snow & ice', 'Permanent water bodies', 'Herbaceous wetland', 'Moss & lichen'] },
  ru: { north: 'Северный гидрологический регион', south: 'Южный гидрологический регион', rivers: 'Реки', lakes: 'Озёра',
        watersheds: 'Водосборы (14)', wb: 'Продукты водного баланса · 14 бассейнов', wmb: 'Статистика водопользования · 5 бассейнов',
        wmbOther: 'Другие водохозяйственные бассейны',
        lulc: ['Леса', 'Кустарники', 'Травянистая растительность', 'Пашни', 'Застройка', 'Голые земли / редкая растительность',
               'Снег и лёд', 'Постоянные водные объекты', 'Травянистые болота', 'Мхи и лишайники'] },
  kk: { north: 'Солтүстік гидрологиялық өңір', south: 'Оңтүстік гидрологиялық өңір', rivers: 'Өзендер', lakes: 'Көлдер',
        watersheds: 'Су жинау алаптары (14)', wb: 'Су балансы өнімдері · 14 алап', wmb: 'Су пайдалану статистикасы · 5 алап',
        wmbOther: 'Басқа су шаруашылығы алаптары',
        lulc: ['Ормандар', 'Бұталар', 'Шөпті өсімдіктер', 'Егістік', 'Құрылыс салынған жерлер', 'Жалаңаш жер / сирек өсімдік',
               'Қар және мұз', 'Тұрақты су объектілері', 'Шөпті батпақтар', 'Мүк және қына'] },
}[SM_LANG];
/* ESA WorldCover 2020 class colours, as drawn by the LULC tile service */
const SM_LULC_COLORS = ['#006400', '#ffbb22', '#ffff4c', '#f096ff', '#fa0000',
                        '#b4b4b4', '#f0f0f0', '#0064c8', '#0096a0', '#fae6a0'];
const SM_LULC_TILES = 'https://tiles.arcgis.com/tiles/Kri0Q7xwN5k6MG7L/arcgis/rest/services/LULC_Boundaries_WTL1/MapServer';
const SM_WU_IDS = new Set(['WMB_00001', 'WMB_00004', 'WMB_00005', 'WMB_00006', 'WMB_00008']);
const smName = id => SM_NAMES[id]?.[SM_LANG] || id;
const smMobile = matchMedia('(max-width: 900px)').matches;
const smReduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
/* sticky offsets follow the real navbar height */
const smSetNav = () => document.documentElement.style.setProperty(
  '--sm-nav', `${document.querySelector('.nla-navbar')?.offsetHeight || 58}px`);
smSetNav();
window.addEventListener('resize', smSetNav);

/* ================================================================
 *  Sidecars: activate the slide / map step of the card in view
 * ================================================================ */
const smObserver = new IntersectionObserver(entries => {
  entries.forEach(e => {
    if (!e.isIntersecting) return;
    const step = e.target, car = step.closest('.sm-sidecar');
    car.querySelectorAll('.sm-step').forEach(s => s.classList.toggle('active', s === step));
    if (step.dataset.slide != null) {
      car.querySelectorAll('.sm-slide').forEach(s => s.classList.toggle('active', s.dataset.slide === step.dataset.slide));
    }
    if (step.dataset.map) smMapStep(step.dataset.map);
  });
}, { rootMargin: smMobile ? '-70% 0px -10% 0px' : '-45% 0px -45% 0px' });   // phones: activate cards below the sticky media
document.querySelectorAll('.sm-step').forEach(s => smObserver.observe(s));

/* ================================================================
 *  Progress bar + chapter dots
 * ================================================================ */
const smBar = document.getElementById('sm-progress');
const smToc = document.querySelector('.sm-toc');
const smChapters = [...document.querySelectorAll('[data-chapter]')];
function smOnScroll () {
  const h = document.documentElement;
  smBar.style.width = `${(100 * h.scrollTop / Math.max(1, h.scrollHeight - h.clientHeight)).toFixed(1)}%`;
  let current = null;
  smChapters.forEach(c => { if (c.getBoundingClientRect().top < window.innerHeight * 0.5) current = c.id; });
  smToc?.querySelectorAll('a').forEach(a => a.classList.toggle('active', a.hash === `#${current}`));
  smToc?.classList.toggle('on-cover', !current);
}
window.addEventListener('scroll', smOnScroll, { passive: true });
smOnScroll();

/* ================================================================
 *  Map tour
 * ================================================================ */
let smMap = null, smLayers = {}, smPending = 'regions', smCurrent = null;
const SM_SOURCES = {
  regions:    'input_data/Hydro Region Boundry.geojson',
  watersheds: 'input_data/ALL_watersheds_wgs84.geojson',
  wmb:        'input_data/Water management basins.geojson',
  rivers:     'input_data/rivers.geojson',
  lakes:      'input_data/lakes.geojson',
};

function smVector (key, style, z) {
  if (!smLayers[key]) {
    smLayers[key] = new ol.layer.Vector({
      source: new ol.source.Vector({ url: SM_SOURCES[key], format: new ol.format.GeoJSON() }),
      visible: false, zIndex: z, declutter: key === 'watersheds' || key === 'wmb',
    });
    smMap.addLayer(smLayers[key]);
  }
  smLayers[key].setStyle(style);
  return smLayers[key];
}

const smFill   = c => new ol.style.Fill({ color: c });
const smStroke = (c, w = 1) => new ol.style.Stroke({ color: c, width: w });
const smText   = (t, size = 12) => new ol.style.Text({
  text: t, font: `${size}px Roboto, Arial, sans-serif`, overflow: true,
  fill: smFill('#0e1c36'), stroke: smStroke('#fff', 3),
});
/* label point in the largest part of a (multi)polygon, cached per feature (styles run every frame) */
function smLabelPoint (f) {
  let p = f.get('_lp');
  if (!p) {
    const g = f.getGeometry();
    p = g.getType() !== 'MultiPolygon' ? (g.getInteriorPoint?.() || g)
      : g.getPolygons().reduce((a, b) => (b.getArea() > a.getArea() ? b : a)).getInteriorPoint();
    f.set('_lp', p, true);
  }
  return p;
}
const smLabelled = (fillOf, strokeOf, textOf) => f => [
  new ol.style.Style({ fill: smFill(fillOf(f)), stroke: strokeOf(f) }),
  new ol.style.Style({ geometry: smLabelPoint, text: textOf(f) }),
];
const smLegend = rows => {
  document.getElementById('sm-map-legend').innerHTML =
    rows.map(([c, t, line]) => `<div class="row-l"><i style="background:${c};${line ? 'height:3px;border:0' : ''}"></i>${t}</div>`).join('');
};

const SM_STEPS = {
  regions () {
    smVector('regions', f => new ol.style.Style({
      fill: smFill(f.get('HYDRO_REGI') === 'North' ? 'rgba(14,28,54,0.30)' : 'rgba(201,168,76,0.40)'),
      stroke: smStroke('#0e1c36', 2),
    }), 1);
    smVector('watersheds', smLabelled(() => 'rgba(0,0,0,0)', () => smStroke('#ffffff', 1.2),
      f => smText(smName(f.get('WATERSHED_ID')), 11)), 2);
    smLegend([['rgba(14,28,54,0.30)', SM_LEGEND.north], ['rgba(201,168,76,0.40)', SM_LEGEND.south]]);
    return { show: ['regions', 'watersheds'], fit: 'regions' };
  },
  catalogue () {
    smVector('watersheds', f => new ol.style.Style({ fill: smFill('rgba(255,255,255,0.35)'), stroke: smStroke('#6c757d', 1) }), 1);
    smVector('rivers', new ol.style.Style({ stroke: smStroke('#2171b5', 1.1) }), 3);
    smVector('lakes', new ol.style.Style({ fill: smFill('#6baed6'), stroke: smStroke('#2171b5', 0.6) }), 4);
    smLegend([['#2171b5', SM_LEGEND.rivers, true], ['#6baed6', SM_LEGEND.lakes], ['rgba(255,255,255,0.6)', SM_LEGEND.watersheds]]);
    return { show: ['watersheds', 'rivers', 'lakes'], fit: 'watersheds' };
  },
  lulc () {
    smVector('watersheds', smLabelled(() => 'rgba(0,0,0,0)', () => smStroke('#0e1c36', 1.4),
      f => smText(smName(f.get('WATERSHED_ID')), 11)), 2);
    smLegend(SM_LULC_COLORS.map((c, i) => [c, SM_LEGEND.lulc[i]]));
    return { show: ['watersheds'], fit: 'watersheds', lulc: true };
  },
  timeseries () {
    smVector('watersheds', smLabelled(() => 'rgba(26,127,110,0.45)', () => smStroke('#1a7f6e', 1.5),
      f => smText(smName(f.get('WATERSHED_ID')), 11)), 2);
    smLegend([['rgba(26,127,110,0.45)', SM_LEGEND.wb]]);
    return { show: ['watersheds'], fit: 'watersheds' };
  },
  wateruse () {
    smVector('wmb', smLabelled(
      f => (SM_WU_IDS.has(f.get('BASIN_ID')) ? 'rgba(49,130,189,0.65)' : 'rgba(200,200,200,0.35)'),
      f => smStroke(SM_WU_IDS.has(f.get('BASIN_ID')) ? '#0e1c36' : '#999', SM_WU_IDS.has(f.get('BASIN_ID')) ? 1.5 : 0.8),
      f => (SM_WU_IDS.has(f.get('BASIN_ID')) ? smText(smName(f.get('BASIN_ID')), 12) : null)), 2);
    smLegend([['rgba(49,130,189,0.65)', SM_LEGEND.wmb], ['rgba(200,200,200,0.35)', SM_LEGEND.wmbOther]]);
    return { show: ['wmb'], fit: 'wmb' };
  },
};

function smMapStep (name) {
  if (!smMap) { smPending = name; return; }
  const cfg = SM_STEPS[name]?.();
  if (!cfg) return;
  smCurrent = name;
  Object.entries(smLayers).forEach(([k, l]) => l.setVisible(cfg.show.includes(k)));
  smMap.getLayers().item(1).setVisible(Boolean(cfg.lulc));   // OSM base (item 0) stays on
  smWhenLoaded(smLayers[cfg.fit].getSource(), src => {
    if (smCurrent !== name) return;                        // a later step is showing now
    smMap.getView().fit(src.getExtent(), { padding: [30, 30, 30, 30], duration: smReduce ? 0 : 900 });
  });
}

/* Run fn once the vector source has its features (OpenLayers 6.3 has no 'featuresloadend') */
function smWhenLoaded (src, fn) {
  if (src.getFeatures().length) { fn(src); return; }
  const key = src.on('change', () => {
    if (src.getState() === 'ready' && src.getFeatures().length) { ol.Observable.unByKey(key); fn(src); }
  });
}

/* Create the map only when the tour is about to come into view (its layers are several MB) */
const smMapEl = document.getElementById('sm-map');
if (smMapEl) {
  new IntersectionObserver((entries, obs) => {
    if (!entries.some(e => e.isIntersecting)) return;
    obs.disconnect();
    smMap = new ol.Map({
      target: smMapEl,
      layers: [
        new ol.layer.Tile({ source: new ol.source.OSM() }),
        // LULC: ESA WorldCover 2020 tile cache (ArcGIS Online, Web Mercator, 512 px tiles, levels 3–9)
        new ol.layer.Tile({ visible: false, opacity: 0.9, source: new ol.source.XYZ({
          attributions: 'LULC: ESA WorldCover 2020 (© ESA WorldCover project, CC BY 4.0)',
          tileSize: 512, minZoom: 3, maxZoom: 9, crossOrigin: 'anonymous',
          url: `${SM_LULC_TILES}/tile/{z}/{y}/{x}` }) }),
      ],
      view: hydroView({ center: ol.proj.fromLonLat([67, 48]), zoom: 4 }),   // locked to the hydro-region extent (mapExtent.js)
      controls: ol.control.defaults({ rotate: false }),
      // the page scrolls the story, so the wheel must not zoom the map
      interactions: ol.interaction.defaults({ mouseWheelZoom: false }),
    });
    hydroLock(smMap);
    // start on the card currently in view (a reader may jump straight to a later step)
    smMapStep(document.querySelector('.sm-step.active[data-map]')?.dataset.map || smPending);
  }, { rootMargin: '600px 0px' }).observe(smMapEl);
}
