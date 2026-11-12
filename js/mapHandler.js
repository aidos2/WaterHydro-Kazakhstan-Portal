/* --------------------------------------------------------------------
 *  mapHandler.js – Basin layers + WB Products choropleth
 *
 *  Data, chart and statistics live in wbHandler.js; this file draws the
 *  map, colours basins by the selected variable/date and routes clicks.
 * ------------------------------------------------------------------*/

let map, selectedFeature = null;

/* single selected basin (kept as a Set for chartHandler compatibility) */
let selectedWatershedIds = new Set();

/* ---------- Utils --------------------------------------------------- */
const $ = (id) => document.getElementById(id);

function fromLonLatXY(lon, lat) {
  return ol.proj.fromLonLat([lon, lat]); // EPSG:4326 → EPSG:3857
}

/* ---------- Language ------------------------------------------------ */
const MAP_I18N = {
  en: { watersheds: 'Watersheds', basins: 'WM Basins', subbasins: 'Sub-basins',
        selected: 'Selected basin', noData: 'No data', unit: 'Unit',
        soon: 'Sub-basin water balance data coming soon' },
  ru: { watersheds: 'Водосборы', basins: 'Бассейны ВХ', subbasins: 'Подбассейны',
        selected: 'Выбранный бассейн', noData: 'Нет данных', unit: 'Ед.',
        soon: 'Данные водного баланса подбассейнов скоро появятся' },
  kz: { watersheds: 'Су жинау алаптары', basins: 'СШ бассейндері', subbasins: 'Ішкі бассейндер',
        selected: 'Таңдалған бассейн', noData: 'Деректер жоқ', unit: 'Бірлік',
        soon: 'Ішкі бассейндердің су балансы деректері жақында қосылады' }
};
const MAP_T = MAP_I18N[WB_LANG];

/* ---------- UI elements -------------------------------------------- */
const metricSelect = $('metricSelect');
const timeSlider   = $('timeSlider');
const sliderDate   = $('sliderDate');
const playPauseBtn = $('playPauseBtn');
const clearBtn     = $('clearSelection');
const legendDiv    = $('legend');
const hoverInfo    = $('hover-info');

/* ---------- Layer config ------------------------------------------- */
const LAYER_CFG = {
  watersheds: { url: 'input_data/ALL_watersheds_wgs84.geojson',   idProp: 'WATERSHED_ID', nameProp: 'WATERSHED_NAME' },
  basins:     { url: 'input_data/Water management basins.geojson', idProp: 'BASIN_ID',     nameProp: 'BASIN_NAME'     },
  subbasins:  { url: 'input_data/watershed_subbasins.geojson',     idProp: null,           nameProp: 'SubBasinName'   }
};
let activeLayerKey = 'watersheds';

/* ---------- No-data hatch fill ------------------------------------- */
const NO_DATA_PATTERN = (() => {
  const c = document.createElement('canvas');
  c.width = c.height = 8;
  const g = c.getContext('2d');
  g.strokeStyle = 'rgba(120,120,120,0.6)';
  g.lineWidth = 2;
  g.beginPath();
  g.moveTo(-2, 2);
  g.lineTo(10, 14);
  g.stroke();
  return g.createPattern(c, 'repeat');
})();

/* ---------- Base layers -------------------------------------------- */
let baseLayers = {
  osm: new ol.layer.Tile({
    source: new ol.source.OSM(),
    visible: true
  }),
  satellite: new ol.layer.Tile({
    source: new ol.source.XYZ({
      attributions: 'Tiles © Esri',
      url: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}'
    }),
    visible: false
  })
};

/* ---------- Vector layers ------------------------------------------ */
let vectorLayers = Object.fromEntries(Object.entries(LAYER_CFG).map(([key, cfg]) => [
  key,
  new ol.layer.Vector({
    source: new ol.source.Vector({ url: cfg.url, format: new ol.format.GeoJSON() }),
    visible: key === activeLayerKey
  })
]));

/* ---------- Map ----------------------------------------------------- */
map = new ol.Map({
  target: 'map',
  layers: [
    baseLayers.osm,
    baseLayers.satellite,
    vectorLayers.basins,
    vectorLayers.watersheds,
    vectorLayers.subbasins
  ],
  view: new ol.View({
    projection: 'EPSG:3857',
    center: fromLonLatXY(72, 48),
    zoom: 4
  })
});

/* ---------- Horizontal top-right Layer switcher UI ----------------- */

const switcher = $('layer-switcher');

switcher.innerHTML = `
  <div style="
      display:flex;
      gap:14px;
      align-items:center;
      background:rgba(255,255,255,0.95);
      padding:8px 16px;
      border-radius:22px;
      border:1px solid #ccc;
      font-size:13px;
      box-shadow:0 2px 6px rgba(0,0,0,0.25);
  ">
    ${Object.keys(LAYER_CFG).map(key => `
    <label style="margin:0;">
      <input type="radio" name="activeLayer" value="${key}" ${key === activeLayerKey ? 'checked' : ''}>
      ${MAP_T[key]}
    </label>`).join('')}
  </div>
`;

switcher.style.position = "absolute";
switcher.style.top = "10px";
switcher.style.right = "10px";
switcher.style.left = "auto";
switcher.style.zIndex = "1000";

switcher.querySelectorAll('input').forEach(input => {
  input.addEventListener('change', e => setActiveLayer(e.target.value));
});

function setActiveLayer(key) {
  activeLayerKey = key;
  Object.entries(vectorLayers).forEach(([k, layer]) => layer.setVisible(k === key));
  stopPlay();
  selectedFeature = null;
  selectedWatershedIds.clear();
  clearBtn.disabled = true;
  fitLayer(key, 600);
  window.wbSetLayer(key);   // resets the WB selection and reloads data
  updateMapStyle();
}

/* ---------- Helpers ------------------------------------------------- */
function featureId(feat) {
  const prop = LAYER_CFG[activeLayerKey].idProp;
  return prop ? feat.get(prop) : null;
}

function featureName(feat) {
  const id = featureId(feat);
  return (id && window.wbBasinName(id)) || feat.get(LAYER_CFG[activeLayerKey].nameProp) || '';
}

function fitLayer(key, duration) {
  const src = vectorLayers[key].getSource();
  const fit = () => {
    const extent = src.getExtent();
    if (extent && extent.every(Number.isFinite)) {
      map.getView().fit(extent, { padding: [40, 40, 40, 40], duration });
    }
  };
  if (src.getFeatures().length) fit();
  else src.once('change', fit);
}

function classIndex(v, breaks) {
  for (let i = 0; i < 5; i++) {
    if (v <= breaks[i + 1]) return i;
  }
  return 4;
}

const fmt = v => (Math.abs(v) >= 100 ? v.toFixed(0) : v.toFixed(1));

/* ---------- Choropleth + legend ------------------------------------ */
function updateMapStyle() {
  const layer = vectorLayers[activeLayerKey];
  const cfg   = WB_VAR[metricSelect.value] || WB_VAR_CONFIG[0];
  const idx   = +timeSlider.value || 0;
  const breaks = window.wbHasData() ? window.wbBreaks(cfg.key) : null;

  /* Layer without WB data (sub-basins): outlines only */
  if (!LAYER_CFG[activeLayerKey].idProp || !breaks) {
    legendDiv.innerHTML = LAYER_CFG[activeLayerKey].idProp
      ? ''
      : `<div style="font-size:12px;max-width:180px;">${MAP_T.soon}</div>`;
    layer.setStyle(feat => new ol.style.Style({
      fill:   new ol.style.Fill({ color: 'rgba(26,127,110,0.12)' }),
      stroke: new ol.style.Stroke({ color: '#1a7f6e', width: 1.2 }),
      text:   new ol.style.Text({
        text: feat.get(LAYER_CFG[activeLayerKey].nameProp) || '',
        font: '11px Poppins, Arial, sans-serif',
        fill: new ol.style.Fill({ color: '#0e1c36' }),
        stroke: new ol.style.Stroke({ color: '#fff', width: 3 }),
        overflow: true,
        placement: 'point'
      })
    }));
    return;
  }

  const date = window.wbDates()[idx] || '';

  legendDiv.innerHTML = `
    <div style="font-size:12px;margin-bottom:6px;max-width:200px;">
      <strong>${wbVarLabel(cfg.key)}</strong><br>
      ${date}
    </div>
    ${breaks.slice(0, -1).map((b, i) => `
      <div class="item" style="display:flex;align-items:center;gap:6px;font-size:12px;">
        <div class="swatch" style="width:14px;height:14px;background:${cfg.ramp[i]};border:1px solid #333;"></div>
        <div>${fmt(breaks[i])} – ${fmt(breaks[i + 1])}</div>
      </div>`).join('')}
    <div class="item" style="display:flex;align-items:center;gap:6px;font-size:12px;margin-top:4px;">
      <div class="swatch" style="width:14px;height:14px;
        background:repeating-linear-gradient(45deg,#ffffff 0 4px,#aaaaaa 4px 8px);border:1px solid #333;"></div>
      <div>${MAP_T.noData}</div>
    </div>
    <div class="item" style="display:flex;align-items:center;gap:6px;font-size:12px;">
      <div class="swatch" style="width:14px;height:14px;border:3px solid #c9a84c;"></div>
      <div>${MAP_T.selected}</div>
    </div>
  `;

  layer.setStyle(feat => {
    const id  = featureId(feat);
    const v   = window.wbValue(id, cfg.key, idx);
    const sel = selectedWatershedIds.has(id);

    return new ol.style.Style({
      fill:   new ol.style.Fill({ color: v == null ? NO_DATA_PATTERN : cfg.ramp[classIndex(v, breaks)] }),
      stroke: new ol.style.Stroke({ color: sel ? '#c9a84c' : '#444', width: sel ? 3.5 : 1 }),
      zIndex: sel ? 1 : 0,
      text: new ol.style.Text({
        text: featureName(feat),
        font: sel ? 'bold 13px Poppins, Arial, sans-serif' : '12px Poppins, Arial, sans-serif',
        fill: new ol.style.Fill({ color: '#000' }),
        stroke: new ol.style.Stroke({ color: '#fff', width: 3 }),
        overflow: true,
        placement: 'point'
      })
    });
  });
}

/* ---------- Data ready (combination loaded / layer switched) -------- */
window.onWBDataReady = function () {
  const dates = window.wbDates();
  const has   = dates.length > 0;

  metricSelect.disabled = !has;
  timeSlider.disabled   = !has;
  playPauseBtn.disabled = !has;

  if (has) {
    timeSlider.max = dates.length - 1;
    if (+timeSlider.value > dates.length - 1) timeSlider.value = 0;
    sliderDate.textContent = dates[+timeSlider.value];
  } else {
    sliderDate.textContent = '--';
  }

  updateMapStyle();
};

/* ---------- Metric select ------------------------------------------ */
metricSelect.innerHTML = WB_VAR_CONFIG
  .map(c => `<option value="${c.key}">${WB_T.vars[c.key]}</option>`)
  .join('');

metricSelect.addEventListener('change', () => {
  window.wbSetMetric(metricSelect.value);
  updateMapStyle();
});

/* ---------- Time slider -------------------------------------------- */
function setDateIndex(i) {
  timeSlider.value = i;
  sliderDate.textContent = window.wbDates()[i] || '--';
  window.wbSetDateIndex(i);
  updateMapStyle();
}

timeSlider.addEventListener('input', () => setDateIndex(+timeSlider.value));

/* ---------- Selection ---------------------------------------------- */
map.on('singleclick', evt => {
  if (!window.wbHasData()) return;
  const layer = vectorLayers[activeLayerKey];
  const feat = map.forEachFeatureAtPixel(evt.pixel, f => f, { layerFilter: l => l === layer });
  const id = feat && featureId(feat);
  if (!id || !window.wbBasinName(id)) return;

  selectedFeature = feat;
  selectedWatershedIds.clear();
  selectedWatershedIds.add(id);
  clearBtn.disabled = false;

  map.getView().fit(feat.getGeometry(), { padding: [40, 40, 40, 40], duration: 300 });
  window.wbSelectBasin(id);
  updateMapStyle();
});

/* ---------- Clear selection (Show All) ----------------------------- */
clearBtn.addEventListener('click', () => {
  selectedFeature = null;
  selectedWatershedIds.clear();
  clearBtn.disabled = true;
  fitLayer(activeLayerKey, 400);
  window.wbSelectBasin(null);
  updateMapStyle();
});

/* ---------- Hover info --------------------------------------------- */
map.on('pointermove', evt => {
  if (evt.dragging) return;
  const layer = vectorLayers[activeLayerKey];
  const feat = map.forEachFeatureAtPixel(evt.pixel, f => f, { layerFilter: l => l === layer });
  if (!feat) {
    hoverInfo.style.display = 'none';
    map.getTargetElement().style.cursor = '';
    return;
  }
  const id  = featureId(feat);
  const key = metricSelect.value;
  const v   = id ? window.wbValue(id, key, +timeSlider.value || 0) : null;
  hoverInfo.innerHTML = `<strong>${featureName(feat)}</strong>` +
    (id && window.wbHasData()
      ? `<br>${WB_VAR[key].short}: ${v == null ? MAP_T.noData : v.toFixed(2) + ' mm/mo'}`
      : '');
  hoverInfo.style.display = 'block';
  map.getTargetElement().style.cursor = id && window.wbBasinName(id) ? 'pointer' : '';
});

/* ---------- Play/Pause animation ----------------------------------- */
let playInterval, isPlaying = false;
const PLAY_LABEL  = playPauseBtn.innerHTML;
const PAUSE_LABEL = '&#10074;&#10074;';

function stopPlay() {
  clearInterval(playInterval);
  playPauseBtn.innerHTML = PLAY_LABEL;
  isPlaying = false;
}

playPauseBtn.addEventListener('click', () => {
  if (!window.wbDates().length) return;

  if (isPlaying) { stopPlay(); return; }

  if (+timeSlider.value >= +timeSlider.max) setDateIndex(0);

  playInterval = setInterval(() => {
    const cur = +timeSlider.value;
    if (cur < +timeSlider.max) setDateIndex(cur + 1);
    else stopPlay();
  }, 600);

  playPauseBtn.innerHTML = PAUSE_LABEL;
  isPlaying = true;
});

/* ---------- First load init ---------------------------------------- */
timeSlider.value = 0;   // start at 01.10.2002 (an unset range defaults to mid-range)
fitLayer(activeLayerKey, 600);
updateMapStyle();
window.wbSetLayer(activeLayerKey);

window.selectedWatershedIds = selectedWatershedIds;
window.selectedFeature = selectedFeature;
