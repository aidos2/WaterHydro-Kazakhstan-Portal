/* --------------------------------------------------------------------
 *  mapHandler.js – Multi-layer Choropleth + Time-series Charts
 * ------------------------------------------------------------------*/

let map, selectedFeature = null;
let watershedNames = {}, latestData = [];
let selectedMetric = '';
let timeSeriesByWatershed = {}, allDates = [];

/* NEW: support multiple selected watersheds */
let selectedWatershedIds = new Set();

/* ---------- Utils --------------------------------------------------- */
const $ = (id) => document.getElementById(id);

function fromLonLatXY(lon, lat) {
  return ol.proj.fromLonLat([lon, lat]); // EPSG:4326 → EPSG:3857
}

function parseDDMMYYYY(d) {
  if (!d) return null;
  if (d.includes('.')) {
    const [dd, mm, yyyy] = d.split('.');
    return new Date(`${yyyy}-${mm}-${dd}T00:00:00Z`);
  }
  return new Date(d);
}

function safeNumber(str) {
  if (str === null || str === undefined) return null;
  const n = parseFloat(String(str).replace(',', '.'));
  return Number.isFinite(n) ? n : null;
}

/* ---------- UI elements -------------------------------------------- */
const fileSelect   = $('fileSelect');
const metricSelect = $('metricSelect');
const timeSlider   = $('timeSlider');
const sliderDate   = $('sliderDate');
const playPauseBtn = $('playPauseBtn');
const clearBtn     = $('clearSelection');
const legendDiv    = $('legend');
const selectedBasinsDiv = $('selectedBasins'); // widget (will exist after HTML change)

/* ---------- Dataset style config ----------------------------------- */
const DATASET_STYLE = {
  "input_data/GLEAM_WaterBalanceAllBAsin.json": {
    name: "Water Balance",
    rampColors: ['#f7fbff','#c6dbef','#6baed6','#3182bd','#08519c'],
    unit: "mm/month"
  },
  "input_data/P_MSWEP_ALL.json": {
    name: "Precipitation (MSWEP)",
    rampColors: ['#f7fcf5','#c7e9c0','#74c476','#31a354','#006d2c'],
    unit: "mm/month"
  },
  "input_data/Soil_Moisture_ERA5.json": {
    name: "Soil Moisture (ERA5)",
    rampColors: ['#fff5f0','#fcbba1','#fc9272','#fb6a4a','#cb181d'],
    unit: "mm/month"
  }
};

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
let vectorLayers = {
  watersheds: new ol.layer.Vector({
    source: new ol.source.Vector({
      url: 'input_data/ALL_watersheds_wgs84.geojson',
      format: new ol.format.GeoJSON()
    }),
    visible: true
  }),
  basins: new ol.layer.Vector({
    source: new ol.source.Vector({
      url: 'input_data/Water management basins.geojson',
      format: new ol.format.GeoJSON()
    }),
    visible: false
  }),
  subbasins: new ol.layer.Vector({
    source: new ol.source.Vector({
      url: 'input_data/watershed_subbasins.geojson',
      format: new ol.format.GeoJSON()
    }),
    visible: false
  })
};

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
    <label style="margin:0;">
      <input type="radio" name="activeLayer" value="watersheds" checked>
      Watersheds
    </label>
    <label style="margin:0;">
      <input type="radio" name="activeLayer" value="basins">
      Basins
    </label>
    <label style="margin:0;">
      <input type="radio" name="activeLayer" value="subbasins">
      Sub-basins
    </label>
  </div>
`;

switcher.style.position = "absolute";
switcher.style.top = "10px";
switcher.style.right = "10px";
switcher.style.left = "auto";
switcher.style.zIndex = "1000";

switcher.querySelectorAll('input').forEach(input => {
  input.addEventListener('change', e => {
    const selectedKey = e.target.value;

    Object.entries(vectorLayers).forEach(([key, layer]) => {
      layer.setVisible(key === selectedKey);
    });

    if (selectedKey === "watersheds") {
      loadWatershedData();
      metricSelect.disabled = false;
      timeSlider.disabled = false;
      playPauseBtn.disabled = false;
    } else {
      metricSelect.disabled = true;
      timeSlider.disabled = true;
      playPauseBtn.disabled = true;
      legendDiv.innerHTML = '';
      selectedWatershedIds.clear();
      updateSelectedWidget();
      drawChart('', [], {}, null);
    }
  });
});

/* ---------- Jenks breaks ------------------------------------------- */
function jenks(values, k) {
  const data = values.slice().sort((a, b) => a - b);
  const min = data[0], max = data[data.length - 1];
  const step = (max - min) / k;
  return Array.from({ length: k + 1 }, (_, i) => min + i * step);
}

/* ---------- Selected basins widget --------------------------------- */
function updateSelectedWidget() {
  if (!selectedBasinsDiv) return;

  if (!selectedWatershedIds.size) {
    selectedBasinsDiv.textContent = 'None';
    return;
  }

  const names = [...selectedWatershedIds].map(
    id => watershedNames[id] || id
  );
  selectedBasinsDiv.textContent = names.join(', ');
}

/* ---------- Choropleth + legend ------------------------------------ */
function updateMapStyle() {
  if (!vectorLayers.watersheds.getVisible()) return;

  /* ── WB Products mode styling ───────────────────────────────────── */
  if (window.wbMode) {
    legendDiv.innerHTML = `
      <div style="font-size:12px;font-weight:700;margin-bottom:6px;color:#0e1c36;">
        Water Balance Products
      </div>
      <div style="display:flex;align-items:center;gap:6px;margin-bottom:4px;font-size:11px;">
        <div style="width:14px;height:14px;background:rgba(26,127,110,0.45);border:2px solid #1a7f6e;"></div>
        WB Product Basins (4)
      </div>
      <div style="display:flex;align-items:center;gap:6px;font-size:11px;">
        <div style="width:14px;height:14px;background:rgba(201,168,76,0.45);border:3px solid #c9a84c;"></div>
        Selected basin
      </div>
      <div style="font-size:10px;color:#888;margin-top:5px;">Click a teal basin to load data</div>
    `;

    vectorLayers.watersheds.setStyle(feat => {
      const id   = feat.get('WATERSHED_ID');
      const name = watershedNames[id] || '';
      const isWB  = WB_IDS.has(id);
      const isSel = selectedWatershedIds.has(id);

      let fill   = isWB ? 'rgba(26,127,110,0.35)' : 'rgba(200,200,200,0.12)';
      let stroke = isWB ? '#1a7f6e'                : '#cccccc';
      let sw     = isWB ? 1.5                      : 0.5;

      if (isSel) {
        fill   = 'rgba(201,168,76,0.45)';
        stroke = '#c9a84c';
        sw     = 3;
      }

      return new ol.style.Style({
        fill:   new ol.style.Fill({ color: fill }),
        stroke: new ol.style.Stroke({ color: stroke, width: sw }),
        text:   isWB ? new ol.style.Text({
          text:      name,
          font:      isSel ? 'bold 13px Poppins,Arial,sans-serif' : '11px Poppins,Arial,sans-serif',
          fill:      new ol.style.Fill({ color: '#0e1c36' }),
          stroke:    new ol.style.Stroke({ color: '#fff', width: 3 }),
          overflow:  true,
          placement: 'point'
        }) : null
      });
    });
    return; // skip original choropleth
  }

  const datasetKey = fileSelect.value;
  const cfg = DATASET_STYLE[datasetKey] || {
    name: "Dataset",
    rampColors: ['#edf8fb','#b2e2e2','#66c2a4','#2ca25f','#006d2c'],
    unit: "mm/month"
  };

  const unit = cfg.unit || "mm/month";

  // Legend header
  let headerHTML = `
    <div style="font-size:13px; margin-bottom:6px;">
      <strong>${cfg.name}</strong><br>
      Metric: ${selectedMetric || "—"}<br>
      Unit: ${unit}
    </div>
    <div style="display:flex;align-items:center;gap:6px;margin-bottom:8px;">
      <span style="
        display:inline-block;width:16px;height:16px;
        background:rgba(0,0,0,0.18);
        border:2px solid #000000;
        border-radius:3px;
      "></span>
      <span>Selected watersheds</span>
    </div>
  `;

  if (!selectedMetric || !allDates.length) {
    legendDiv.innerHTML = headerHTML;
    return;
  }

  const date = allDates[+timeSlider.value || 0];

  const values = Object.values(timeSeriesByWatershed)
    .map(d => d[date])
    .filter(v => Number.isFinite(v));

  if (!values.length) {
    legendDiv.innerHTML = headerHTML +
      `<em style="font-size:12px;">No data for ${date || ''}</em>`;
    return;
  }

  const breaks = jenks(values, 5);
  const ramp = cfg.rampColors || ['#edf8fb','#b2e2e2','#66c2a4','#2ca25f','#006d2c'];

  const classesHTML =
    breaks.slice(0, -1).map((b, i) => `
      <div class="item" style="display:flex;align-items:center;gap:6px;font-size:12px;">
        <div class="swatch" style="width:14px;height:14px;background:${ramp[i]};border:1px solid #333;"></div>
        <div>${breaks[i].toFixed(1)} – ${breaks[i+1].toFixed(1)}</div>
      </div>`).join('') +
    `<div class="item" style="display:flex;align-items:center;gap:6px;font-size:12px;margin-top:4px;">
      <div class="swatch" style="
        width:14px;height:14px;
        background:repeating-linear-gradient(45deg,#ffffff 0 4px,#aaaaaa 4px 8px);
        border:1px solid #333;"></div>
      <div>No data</div>
    </div>`;

  legendDiv.innerHTML = headerHTML + classesHTML;

  // Style function for all polygons
  vectorLayers.watersheds.setStyle(feat => {
    const id   = feat.get('WATERSHED_ID');
    const name = watershedNames[id] || '';
    const v    = timeSeriesByWatershed[id]?.[date];

    let fillColor, strokeColor = '#444', strokeWidth = 1;

    if (v == null || !Number.isFinite(v)) {
      fillColor = NO_DATA_PATTERN;
      strokeColor = '#666';
    } else {
      let cls = 4;
      for (let i = 0; i < 5; i++) {
        if (v >= breaks[i] && v <= breaks[i+1]) { cls = i; break; }
      }
      fillColor = ramp[cls];
    }

    // UNIVERSAL SELECTION STYLE for ALL selected basins
    if (selectedWatershedIds.has(id)) {
      strokeColor = '#000000';
      strokeWidth = 3;
      fillColor   = 'rgba(0,0,0,0.18)';
    }

    return new ol.style.Style({
      fill:   new ol.style.Fill({ color: fillColor }),
      stroke: new ol.style.Stroke({ color: strokeColor, width: strokeWidth }),
      text: new ol.style.Text({
        text: name,
        font: '12px Poppins, Arial, sans-serif',
        fill: new ol.style.Fill({ color: '#000' }),
        stroke: new ol.style.Stroke({ color: '#fff', width: 3 }),
        overflow: true,
        placement: 'point'
      })
    });
  });
}

/* ---------- Build timeseries map ----------------------------------- */
function buildTimeSeriesMap(metric) {
  timeSeriesByWatershed = {};
  latestData.forEach(d => {
    const id   = d.WATERSHED_ID;
    const date = d.date;
    const val  = safeNumber(d[metric]);
    if (id && date && val !== null) {
      (timeSeriesByWatershed[id] ||= {})[date] = val;
    }
  });
}

function extractSortedDates() {
  allDates = Array.from(new Set(latestData.map(d => d.date).filter(Boolean)))
    .sort((a, b) => parseDDMMYYYY(a) - parseDDMMYYYY(b));
}

/* ---------- Load data ---------------------------------------------- */
function loadWatershedData() {
  fetch('input_data/ALL_watersheds_wgs84.geojson')
    .then(r => r.json())
    .then(gj => {
      watershedNames = {};
      (gj.features || []).forEach(f => {
        watershedNames[f.properties.WATERSHED_ID] = f.properties.WATERSHED_NAME;
      });

      const src = vectorLayers.watersheds.getSource();
      if (src) {
        if (src.getState() === 'ready') {
          const extent = src.getExtent();
          if (extent && extent.every(Number.isFinite)) {
            map.getView().fit(extent, { padding: [40,40,40,40], duration: 600 });
          }
        } else {
          src.once('change', e => {
            if (e.target.getState() === 'ready') {
              const extent = src.getExtent();
              if (extent && extent.every(Number.isFinite)) {
                map.getView().fit(extent, { padding: [40,40,40,40], duration: 600 });
              }
            }
          });
        }
      }

      loadData(fileSelect.value);
    });
}

function loadData(url) {
  fetch(url)
    .then(r => r.json())
    .then(data => {
      latestData = data.map(d => {
        if (d.Date && !d.date) d.date = d.Date;
        return d;
      });

      if (!latestData.length) return;

      const sample = latestData[0];
      const metrics = Object.keys(sample).filter(k =>
        !/id|date/i.test(k) && safeNumber(sample[k]) !== null
      );

      metricSelect.innerHTML = metrics.map(m => `<option value="${m}">${m}</option>`).join('');
      selectedMetric = metrics[0] || '';

      buildTimeSeriesMap(selectedMetric);
      extractSortedDates();

      if (allDates.length) {
        timeSlider.max = allDates.length - 1;
        timeSlider.value = 0;
        sliderDate.textContent = allDates[0];
        highlightChartPoint(0);
      }

      selectedWatershedIds.clear();
      updateSelectedWidget();
      updateMapStyle();

      // IMPORTANT: we filter later in drawChart based on selection
      drawChart(selectedMetric, latestData, watershedNames, null);
      window.updateBasinStats?.();
    });
}

/* ---------- Dataset change ----------------------------------------- */
fileSelect.addEventListener('change', () => {
  // ── WB Products mode ──────────────────────────────────────────────
  if (fileSelect.value === 'wb_products') {
    window.activateWBMode?.();
    return;
  }

  // Switching away from WB Products mode
  if (window.wbMode) {
    window.deactivateWBMode?.();
    selectedWatershedIds.clear();
    updateSelectedWidget();
  }

  if (vectorLayers.watersheds.getVisible()) {
    loadData(fileSelect.value);
  }
});

/* ---------- Metric change ------------------------------------------ */
metricSelect.addEventListener('change', () => {
  selectedMetric = metricSelect.value;
  window.selectedMetric = selectedMetric; // *** чтобы глобальная метрика была актуальной

  buildTimeSeriesMap(selectedMetric);
  extractSortedDates();

  if (allDates.length) {
    timeSlider.max = allDates.length - 1;
    timeSlider.value = 0;
    sliderDate.textContent = allDates[0];
    highlightChartPoint(0);
  }

  updateMapStyle();

  // Re-draw chart with current selection
  const ids = [...selectedWatershedIds];
  const chartData = ids.length
    ? latestData.filter(d => ids.includes(d.WATERSHED_ID))
    : latestData;
  drawChart(selectedMetric, chartData, watershedNames, null);
  window.updateBasinStats?.();
});

/* ---------- WB basin IDs (used in click handler + updateMapStyle) -- */
const WB_IDS = new Set(['NWB_00001', 'NWB_00003', 'NWB_00007', 'NWB_00009']);

/* ---------- Selection: MULTI-SELECTION on map ---------------------- */
map.on('singleclick', evt => {
  if (!vectorLayers.watersheds.getVisible()) return;
  const feat = map.forEachFeatureAtPixel(evt.pixel, f => f);
  if (feat && feat.get('WATERSHED_ID')) {
    selectedFeature = feat;
    const id = feat.get('WATERSHED_ID');

    // ── WB Products mode: route to wbHandler ─────────────────────────
    if (window.wbMode) {
      if (!WB_IDS.has(id)) return; // ignore non-WB basins
      selectedWatershedIds.clear();
      selectedWatershedIds.add(id);
      updateSelectedWidget();
      clearBtn.disabled = false;
      map.getView().fit(feat.getGeometry(), { padding: [40, 40, 40, 40], duration: 300 });
      updateMapStyle();
      window.onWBBasinMapClick?.(id);
      return;
    }

    // Toggle selection
    if (selectedWatershedIds.has(id)) {
      selectedWatershedIds.delete(id);
    } else {
      selectedWatershedIds.add(id);
    }

    updateSelectedWidget();
    clearBtn.disabled = selectedWatershedIds.size === 0;

    // Optional: zoom to last clicked feature
    map.getView().fit(feat.getGeometry(), {
      padding: [40, 40, 40, 40],
      duration: 250
    });

    updateMapStyle();

    // Filter data for chart: only selected basins, or all if none
    const ids = [...selectedWatershedIds];
    const chartData = ids.length
      ? latestData.filter(d => ids.includes(d.WATERSHED_ID))
      : latestData;

    drawChart(selectedMetric, chartData, watershedNames, null);
    window.updateBasinStats?.();
  }
});

/* ---------- Clear selection (Show All) ----------------------------- */
clearBtn.addEventListener('click', () => {
  selectedFeature = null;
  selectedWatershedIds.clear();
  updateSelectedWidget();

  const src = vectorLayers.watersheds.getSource();
  if (src && src.getState() === 'ready') {
    const extent = src.getExtent();
    if (extent && extent.every(Number.isFinite)) {
      map.getView().fit(extent, { padding: [40, 40, 40, 40], duration: 400 });
    }
  } else if (src) {
    src.once('change', e => {
      if (e.target.getState() === 'ready') {
        const extent = src.getExtent();
        if (extent && extent.every(Number.isFinite)) {
          map.getView().fit(extent, { padding: [40, 40, 40, 40], duration: 400 });
        }
      }
    });
  }

  updateMapStyle();
  drawChart(selectedMetric, latestData, watershedNames, null);
  window.updateBasinStats?.();
  clearBtn.disabled = true;
});

/* ---------- Play/Pause animation ----------------------------------- */
let playInterval, isPlaying = false;

playPauseBtn.addEventListener('click', () => {
  if (!allDates.length) return;

  if (isPlaying) {
    clearInterval(playInterval);
    playPauseBtn.textContent = '▶';
    isPlaying = false;
    return;
  }

  playInterval = setInterval(() => {
    let cur = +timeSlider.value;
    if (cur < +timeSlider.max) {
      timeSlider.value = cur + 1;
      sliderDate.textContent = allDates[cur + 1];
      updateMapStyle();
      highlightChartPoint(cur + 1);
    } else {
      clearInterval(playInterval);
      playPauseBtn.textContent = '▶';
      isPlaying = false;
    }
  }, 600);

  playPauseBtn.textContent = '❚❚';
  isPlaying = true;
});

/* ---------- Stubs for charts (safety) ------------------------------ */
window.drawChart ??= () => {};
window.highlightChartPoint ??= () => {};

/* ---------- First load init ---------------------------------------- */
loadWatershedData();
metricSelect.disabled = false;
timeSlider.disabled = false;
playPauseBtn.disabled = false;

window.selectedWatershedIds = selectedWatershedIds;
window.selectedFeature = selectedFeature;
window.watershedNames = watershedNames;
