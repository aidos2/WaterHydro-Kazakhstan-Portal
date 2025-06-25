/* --------------------------------------------------------------------
 *  mapHandler.js  –  Time-series choropleth with “no data” hatch
 * ------------------------------------------------------------------*/

let map, vectorLayer, selectedFeature = null;
let watershedNames = {}, latestData = [];
let selectedMetric = '', selectedWatershedId = null;
let timeSeriesByWatershed = {}, allDates = [];

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
  }),
  terrain: new ol.layer.Tile({
    source: new ol.source.XYZ({
      attributions: 'Stamen Terrain',
      url: 'https://stamen-tiles.a.ssl.fastly.net/terrain/{z}/{x}/{y}.jpg'
    }),
    visible: false
  }),
  toner: new ol.layer.Tile({
    source: new ol.source.XYZ({
      attributions: 'Stamen Toner',
      url: 'https://stamen-tiles.a.ssl.fastly.net/toner-lite/{z}/{x}/{y}.png'
    }),
    visible: false
  }),
  none: new ol.layer.Tile({ visible: false })
};

/* ---------- UI elements -------------------------------------------------- */
const fileSelect   = document.getElementById('fileSelect');
const metricSelect = document.getElementById('metricSelect');
const timeSlider   = document.getElementById('timeSlider');
const sliderDate   = document.getElementById('sliderDate');
const playPauseBtn = document.getElementById('playPauseBtn');
const clearBtn     = document.getElementById('clearSelection');
const hoverInfo    = document.getElementById('hover-info');
const legendDiv    = document.getElementById('legend');

/* ---------- hatched pattern for “no data” polygons ----------------------- */
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

/* ---------- map & vector layer ------------------------------------------ */
vectorLayer = new ol.layer.Vector({
  source: new ol.source.Vector({
    url: 'input_data/ALL_watersheds_wgs84.geojson',
    format: new ol.format.GeoJSON()
  })
});

map = new ol.Map({
  target: 'map',
  layers: [
    baseLayers.osm,
    baseLayers.satellite,
    baseLayers.terrain,
    baseLayers.toner,
    baseLayers.none,
    vectorLayer
  ],
  view: new ol.View({
    projection: 'EPSG:4326',
    center: [72, 48],
    zoom: 4.5
  })
});



/* ---------- helper: safe numeric parsing -------------------------------- */
function safeNumber(str) {
  if (str === null || str === undefined) return null;
  const n = parseFloat(String(str).replace(',', '.'));
  return Number.isFinite(n) ? n : null;
}

/* ---------- Jenks with fallback ----------------------------------------- */
function jenksSafe(vals) {
  const data = vals.filter(Number.isFinite);
  if (data.length < 5) return [Math.min(...data), Math.max(...data)];
  return jenks(data, 5);
}

/* ---------- hover tooltip ------------------------------------------------ */
map.on('pointermove', evt => {
  const feat = map.forEachFeatureAtPixel(evt.pixel, f => f);
  if (feat) {
    const id = feat.get('WATERSHED_ID');
    hoverInfo.innerHTML = `<strong>${watershedNames[id]}</strong><br>ID: ${id}`;
    hoverInfo.style.display = 'block';
  } else {
    hoverInfo.style.display = 'none';
  }
});

/* ---------- click to filter --------------------------------------------- */
map.on('singleclick', evt => {
  const feat = map.forEachFeatureAtPixel(evt.pixel, f => f);
  if (feat) {
    selectedFeature     = feat;
    selectedWatershedId = feat.get('WATERSHED_ID');
    drawChart(selectedMetric, latestData, watershedNames, selectedWatershedId);
    exportGeoJSONForSelected(feat);
    exportSelectedCSV(latestData, selectedMetric, selectedWatershedId);
    exportChartImage();
    clearBtn.disabled = false;
    map.getView().fit(feat.getGeometry(), { padding: [40, 40, 40, 40] });
  }
});

/* ---------- ▲ Show-All button (refreshed downloads) --------------------- */
clearBtn.addEventListener('click', () => {
  selectedWatershedId = null;
  selectedFeature     = null;
  drawChart(selectedMetric, latestData, watershedNames, null);  // all basins
  exportChartImage();                                           // update PNG
  exportSelectedCSV(latestData, selectedMetric, null);          // CSV = all
  document.getElementById('downloadGeoJSON').href = '';         // disable GJ
  clearBtn.disabled = true;

  // Zoom to full extent of all watersheds
  const extent = vectorLayer.getSource().getExtent();
  if (extent && extent.every(Number.isFinite)) {
    map.getView().fit(extent, { padding: [40, 40, 40, 40] });
  }
});


/* ---------- load watershed names, then data ----------------------------- */
fetch('input_data/ALL_watersheds_wgs84.geojson')
  .then(r => r.json())
  .then(gj => {
    gj.features.forEach(f => {
      watershedNames[f.properties.WATERSHED_ID] = f.properties.WATERSHED_NAME;
    });
    loadData(fileSelect.value);
  });

/* ---------- dropdown handlers ------------------------------------------- */
fileSelect.addEventListener('change', () => loadData(fileSelect.value));
metricSelect.addEventListener('change', () => {
  selectedMetric = metricSelect.value;
  buildTimeSeriesMap(selectedMetric);
  extractSortedDates();
  timeSlider.max = allDates.length - 1;
  timeSlider.value = 0;
  updateMapStyle();
  updateSliderDate();
  drawChart(selectedMetric, latestData, watershedNames, selectedWatershedId);
  highlightChartPoint(0);
});

/* ---------- slider & animation ------------------------------------------ */
timeSlider.addEventListener('input', () => {
  updateMapStyle();
  updateSliderDate();
  highlightChartPoint(+timeSlider.value);
});

let playInterval, isPlaying = false;
playPauseBtn.addEventListener('click', () => {
  if (isPlaying) {
    clearInterval(playInterval);
    playPauseBtn.textContent = '▶';
    isPlaying = false;
    return;
  }
  playInterval = setInterval(() => {
    if (+timeSlider.value < timeSlider.max) {
      timeSlider.value++;
      updateMapStyle();
      updateSliderDate();
      highlightChartPoint(+timeSlider.value);
    } else {
      clearInterval(playInterval);
      playPauseBtn.textContent = '▶';
      isPlaying = false;
    }
  }, 500);
  playPauseBtn.textContent = '❚❚';
  isPlaying = true;
});

/* ---------- core loaders ------------------------------------------------- */
function loadData(url) {
  fetch(url)
    .then(r => r.json())
    .then(data => {
      latestData = data.map(d => {
        if (d.Date && !d.date) d.date = d.Date;
        return d;
      });

      /* detect numeric metrics */
      const sample  = latestData[0];
      const metrics = Object.keys(sample).filter(k =>
        !/id|date/i.test(k) && safeNumber(sample[k]) !== null
      );
      metricSelect.innerHTML = metrics
        .map(m => `<option value="${m}">${m}</option>`).join('');
      metricSelect.disabled = false;
      selectedMetric = metrics[0];

      buildTimeSeriesMap(selectedMetric);
      extractSortedDates();
      timeSlider.max = allDates.length - 1;
      timeSlider.disabled = false;
      playPauseBtn.disabled = false;

      /* wait until GeoJSON fully loads */
      if (vectorLayer.getSource().getState() === 'ready') {
        updateMapStyle();
      } else {
        vectorLayer.getSource().once('change', e => {
          if (e.target.getState() === 'ready') updateMapStyle();
        });
      }
      updateSliderDate();
      drawChart(selectedMetric, latestData, watershedNames, selectedWatershedId);
      highlightChartPoint(0);
    });
}

function buildTimeSeriesMap(metric) {
  timeSeriesByWatershed = {};
  latestData.forEach(d => {
    const id   = d.WATERSHED_ID;
    const date = d.date;
    const val  = safeNumber(d[metric]);
    if (val === null) return;
    timeSeriesByWatershed[id] = timeSeriesByWatershed[id] || {};
    timeSeriesByWatershed[id][date] = val;
  });
}

function extractSortedDates() {
  allDates = Array.from(new Set(latestData.map(d => d.date)))
    .sort((a, b) =>
      new Date(a.split('.').reverse().join('-')) -
      new Date(b.split('.').reverse().join('-'))
    );
}

function updateSliderDate() {
  sliderDate.textContent = allDates[timeSlider.value] || '--';
}

/* ---------- Jenks natural breaks (unchanged) ---------------------------- */
function jenks(data, n) {
  data = data.slice().sort((a, b) => a - b);
  const lower = [], variance = [],
        prefix = [0], prefixSq = [0];

  for (let i = 0; i <= data.length; i++) {
    lower[i] = []; variance[i] = [];
    for (let j = 0; j <= n; j++) {
      lower[i][j] = 0;
      variance[i][j] = Infinity;
    }
  }

  for (let i = 1; i <= data.length; i++) {
    prefix[i]   = prefix[i-1] + data[i-1];
    prefixSq[i] = prefixSq[i-1] + data[i-1]*data[i-1];
    lower[i][1] = 1;
    variance[i][1] = prefixSq[i] - (prefix[i]*prefix[i])/i;
  }

  for (let k = 2; k <= n; k++) {
    for (let i = k; i <= data.length; i++) {
      let best = Infinity, idx = 0;
      for (let j = k-1; j < i; j++) {
        const s1 = prefix[i] - prefix[j];
        const s2 = prefixSq[i] - prefixSq[j];
        const w  = i - j;
        const varW = s2 - (s1*s1)/w;
        const val  = varW + variance[j][k-1];
        if (val < best) { best = val; idx = j; }
      }
      lower[i][k] = idx;
      variance[i][k] = best;
    }
  }

  const breaks = [data[data.length-1]];
  let cls = n, k = data.length;
  while (cls > 1) {
    const idx = lower[k][cls];
    breaks.push(data[idx-1]);
    k = idx; cls--;
  }
  breaks.push(data[0]);
  return breaks.reverse();
}

/* ---------- map styling -------------------------------------------------- */
function updateMapStyle() {
  const date   = allDates[timeSlider.value];
  const values = Object.values(timeSeriesByWatershed)
                       .map(d => d[date])
                       .filter(v => v !== undefined && v !== null);

  const breaks = jenksSafe(values);
  const colors = ['#edf8fb','#b2e2e2','#66c2a4','#2ca25f','#006d2c'];

  /* legend ------------------------------------------------------------- */
  const fmt = n => n.toLocaleString('kk-KZ', { maximumFractionDigits: 1 });
  legendDiv.innerHTML =
    breaks.slice(0, 5).map((b, i) => `
      <div class="item">
        <div class="swatch" style="background:${colors[i]}"></div>
        <div>${fmt(breaks[i])} – ${fmt(breaks[i+1])}</div>
      </div>`).join('') +
    `<div class="item">
       <div class="swatch"
            style="background:
              repeating-linear-gradient(45deg,#ffffff 0 4px,#aaaaaa 4px 8px);">
       </div>
       <div>No data</div>
     </div>`;

  /* per-feature style -------------------------------------------------- */
  vectorLayer.setStyle(feat => {
    const id = feat.get('WATERSHED_ID');
    const v  = timeSeriesByWatershed[id]?.[date];

    if (v == null || isNaN(v)) {                      // hatched
      return new ol.style.Style({
        fill:   new ol.style.Fill({ color: NO_DATA_PATTERN }),
        stroke: new ol.style.Stroke({ color: '#666', width: 1 })
      });
    }

    let cls = breaks.findIndex(
      (b, i) => i < breaks.length-1 && v >= breaks[i] && v <= breaks[i+1]
    );
    if (cls < 0) cls = 4;
    return new ol.style.Style({
      fill:   new ol.style.Fill({ color: colors[cls] }),
      stroke: new ol.style.Stroke({ color: '#444', width: 1 })
    });
  });
}

document.getElementById('basemapSelect').addEventListener('change', e => {
  const selected = e.target.value;
  Object.entries(baseLayers).forEach(([key, layer]) => {
    layer.setVisible(key === selected);
  });
});


/* ---------- stubs (safe if chartHandler not yet loaded) ------------------ */
window.drawChart              ??= () => {};
window.exportChartImage       ??= () => {};
window.exportSelectedCSV      ??= () => {};
window.exportGeoJSONForSelected??= () => {};
window.highlightChartPoint    ??= () => {};
