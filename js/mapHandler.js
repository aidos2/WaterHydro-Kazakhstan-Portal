/* --------------------------------------------------------------------
 *  mapHandler.js – Multi-layer Choropleth + Time-series Charts
 * ------------------------------------------------------------------*/

let map, selectedFeature = null;
let watershedNames = {}, latestData = [];
let selectedMetric = '', selectedWatershedId = null;
let timeSeriesByWatershed = {}, allDates = [];

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
const hoverInfo    = $('hover-info');
const legendDiv    = $('legend');

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

/* ---------- Base layers (only OSM + World Imagery) ----------------- */
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
    visible: true // ✅ start with watersheds visible
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
      url: 'input_data/waterhed_subbasins.geojson',
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
    zoom: 5
  })
});

/* ---------- Layer switcher UI -------------------------------------- */
const switcher = $('layer-switcher');
switcher.innerHTML = `
  <label><input type="radio" name="activeLayer" value="basins"> Water Management Basins</label><br> 
  <label><input type="radio" name="activeLayer" value="watersheds" checked> All Watersheds</label><br>
  <label><input type="radio" name="activeLayer" value="subbasins"> Sub-basins</label>
`;

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

/* ---------- Choropleth with labels -------------------------------- */
function updateMapStyle() {
  if (!vectorLayers.watersheds.getVisible()) return;
  if (!selectedMetric || !allDates.length) return;

  const date = allDates[+timeSlider.value || 0];
  const values = Object.values(timeSeriesByWatershed)
    .map(d => d[date])
    .filter(v => Number.isFinite(v));

  if (!values.length) return;

  const breaks = jenks(values, 5);
  const colors = ['#edf8fb','#b2e2e2','#66c2a4','#2ca25f','#006d2c'];

  // Legend
  legendDiv.innerHTML =
    breaks.slice(0, -1).map((b, i) => `
      <div class="item">
        <div class="swatch" style="background:${colors[i]}"></div>
        <div>${breaks[i].toFixed(1)} – ${breaks[i+1].toFixed(1)}</div>
      </div>`).join('') +
    `<div class="item">
      <div class="swatch" style="background:
        repeating-linear-gradient(45deg,#ffffff 0 4px,#aaaaaa 4px 8px);"></div>
      <div>No data</div>
    </div>`;

  // Style
  vectorLayers.watersheds.setStyle(feat => {
    const id   = feat.get('WATERSHED_ID');
    const name = watershedNames[id] || '';
    const v    = timeSeriesByWatershed[id]?.[date];

    let fillColor, strokeColor = '#444';

    if (v == null || !Number.isFinite(v)) {
      fillColor = NO_DATA_PATTERN;
      strokeColor = '#666';
    } else {
      let cls = 4;
      for (let i = 0; i < 5; i++) {
        if (v >= breaks[i] && v <= breaks[i+1]) { cls = i; break; }
      }
      fillColor = colors[cls];
    }

    if (id === selectedWatershedId) strokeColor = '#000';

    return new ol.style.Style({
      fill:   new ol.style.Fill({ color: fillColor }),
      stroke: new ol.style.Stroke({ color: strokeColor, width: (id === selectedWatershedId ? 2 : 1) }),
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

      // ✅ Fit map to full extent of watersheds on first load
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

      updateMapStyle();
      drawChart(selectedMetric, latestData, watershedNames, null); // all by default
    });
}

/* ---------- Dataset change ----------------------------------------- */
fileSelect.addEventListener('change', () => {
  if (vectorLayers.watersheds.getVisible()) {
    loadData(fileSelect.value);
  }
});

/* ---------- Metric change ------------------------------------------ */
metricSelect.addEventListener('change', () => {
  selectedMetric = metricSelect.value;
  buildTimeSeriesMap(selectedMetric);
  extractSortedDates();

  if (allDates.length) {
    timeSlider.max = allDates.length - 1;
    timeSlider.value = 0;
    sliderDate.textContent = allDates[0];
    highlightChartPoint(0);
  }

  updateMapStyle();
  drawChart(selectedMetric, latestData, watershedNames, selectedWatershedId);
});

/* ---------- Selection: show single chart --------------------------- */
map.on('singleclick', evt => {
  if (!vectorLayers.watersheds.getVisible()) return;
  const feat = map.forEachFeatureAtPixel(evt.pixel, f => f);
  if (feat && feat.get('WATERSHED_ID')) {
    selectedFeature     = feat;
    selectedWatershedId = feat.get('WATERSHED_ID');
    drawChart(selectedMetric, latestData, watershedNames, selectedWatershedId);
    clearBtn.disabled = false;
    map.getView().fit(feat.getGeometry(), { padding: [40, 40, 40, 40], duration: 250 });
    updateMapStyle();
  }
});

/* ---------- Clear selection (Show All) ----------------------------- */
clearBtn.addEventListener('click', () => {
  selectedWatershedId = null;
  selectedFeature     = null;

  drawChart(selectedMetric, latestData, watershedNames, null);
  clearBtn.disabled = true;

  const src = vectorLayers.watersheds.getSource();
  if (src && src.getState() === 'ready') {
    const extent = src.getExtent();
    if (extent && extent.every(Number.isFinite)) {
      map.getView().fit(extent, { padding: [40, 40, 40, 40], duration: 400 });
    }
  } else {
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



/* ---------- Stubs for charts --------------------------------------- */
window.drawChart ??= () => {};
window.highlightChartPoint ??= () => {};

/* ---------- First load init ---------------------------------------- */
loadWatershedData();
metricSelect.disabled = false;
timeSlider.disabled = false;
playPauseBtn.disabled = false;
