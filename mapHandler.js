let map, vectorLayer, selectedFeature = null;
let watershedNames = {}, latestData = [];
let selectedMetric = '', selectedWatershedId = null;
let timeSeriesByWatershed = {}, allDates = [];

const fileSelect   = document.getElementById('fileSelect');
const metricSelect = document.getElementById('metricSelect');
const timeSlider   = document.getElementById('timeSlider');
const sliderDate   = document.getElementById('sliderDate');
const playPauseBtn = document.getElementById('playPauseBtn');
const clearBtn     = document.getElementById('clearSelection');
const hoverInfo    = document.getElementById('hover-info');
const legendDiv    = document.getElementById('legend');

// 1) Initialize map & vector layer
vectorLayer = new ol.layer.Vector({
  source: new ol.source.Vector({
    url: 'input_data/north_watersheds_wgs84.geojson',
    format: new ol.format.GeoJSON()
  })
});
map = new ol.Map({
  target: 'map',
  layers: [
    new ol.layer.Tile({ source: new ol.source.OSM() }),
    vectorLayer
  ],
  view: new ol.View({
    projection: 'EPSG:4326',
    center: [72, 48],
    zoom: 4.5
  })
});

// 2) Hover tooltip
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

// 3) Click filtering
map.on('singleclick', evt => {
  const feat = map.forEachFeatureAtPixel(evt.pixel, f => f);
  if (feat) {
    selectedFeature = feat;
    selectedWatershedId = feat.get('WATERSHED_ID');
    drawChart(selectedMetric, latestData, watershedNames, selectedWatershedId);
    exportGeoJSONForSelected(feat);
    exportSelectedCSV(latestData, selectedMetric, selectedWatershedId);
    exportChartImage();
    clearBtn.disabled = false;
  }
});
clearBtn.addEventListener('click', () => {
  selectedWatershedId = null;
  selectedFeature = null;
  drawChart(selectedMetric, latestData, watershedNames, null);
  clearBtn.disabled = true;
});

// 4) Load watershed names
fetch('input_data/north_watersheds_wgs84.geojson')
  .then(r => r.json())
  .then(gj => {
    gj.features.forEach(f => {
      watershedNames[f.properties.WATERSHED_ID] = f.properties.WATERSHED_NAME;
    });
    loadData(fileSelect.value);
  });

// 5) Dropdown handlers
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

// 6) Slider & play/pause
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
  } else {
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
  }
  isPlaying = !isPlaying;
});

// 7) Load and process data
function loadData(url) {
  fetch(url)
    .then(r => r.json())
    .then(data => {
      latestData = data.map(d => {
        if (d.Date && !d.date) d.date = d.Date;
        return d;
      });

      const sample = latestData[0];
      const metrics = Object.keys(sample).filter(k =>
        !/id|date/i.test(k) &&
        !isNaN(parseFloat(sample[k].toString().replace(',', '.')))
      );
      metricSelect.innerHTML = metrics
        .map(m => `<option value="${m}">${m}</option>`)
        .join('');
      metricSelect.disabled = false;
      selectedMetric = metrics[0];

      buildTimeSeriesMap(selectedMetric);
      extractSortedDates();
      timeSlider.max = allDates.length - 1;
      timeSlider.disabled = false;
      playPauseBtn.disabled = false;

      updateMapStyle();
      updateSliderDate();
      drawChart(selectedMetric, latestData, watershedNames, selectedWatershedId);
      highlightChartPoint(0);
    });
}

function buildTimeSeriesMap(metric) {
  timeSeriesByWatershed = {};
  latestData.forEach(d => {
    const id = d.WATERSHED_ID,
          date = d.date,
          val  = parseFloat(d[metric].replace(',', '.'));
    timeSeriesByWatershed[id] = timeSeriesByWatershed[id] || {};
    timeSeriesByWatershed[id][date] = val;
  });
}

function extractSortedDates() {
  allDates = Array.from(new Set(latestData.map(d => d.date)))
    .sort((a,b) =>
      new Date(a.split('.').reverse().join('-')) -
      new Date(b.split('.').reverse().join('-'))
    );
}

function updateSliderDate() {
  sliderDate.textContent = allDates[timeSlider.value] || '--';
}

// Jenks natural breaks
function jenks(data, n) {
  data = data.slice().sort((a,b) => a - b);
  const lower = [], variance = [];
  for (let i = 0; i <= data.length; i++) {
    lower[i] = [], variance[i] = [];
    for (let j = 0; j <= n; j++) {
      lower[i][j] = 0;
      variance[i][j] = Infinity;
    }
  }

  const prefix = [0], prefixSq = [0];
  for (let i = 1; i <= data.length; i++) {
    prefix[i] = prefix[i-1] + data[i-1];
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
        const w = i - j;
        const varW = s2 - (s1*s1)/w;
        const val = varW + variance[j][k-1];
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

function updateMapStyle() {
  const date = allDates[timeSlider.value];
  const values = Object.values(timeSeriesByWatershed)
    .map(d => d[date]).filter(v => v != null);
  const breaks = jenks(values, 5);
  const colors = ['#edf8fb','#b2e2e2','#66c2a4','#2ca25f','#006d2c'];

  legendDiv.innerHTML = breaks.slice(0,5).map((b,i)=>`
    <div class="item">
      <div class="swatch" style="background:${colors[i]}"></div>
      <div>${breaks[i].toFixed(1)} – ${breaks[i+1].toFixed(1)}</div>
    </div>`).join('');

  vectorLayer.setStyle(feat => {
    const id = feat.get('WATERSHED_ID');
    const v  = timeSeriesByWatershed[id]?.[date];
    let cls = breaks.findIndex((b,i)=>i<breaks.length-1 && v>=breaks[i] && v<=breaks[i+1]);
    if (cls < 0) cls = 4;
    return new ol.style.Style({
      fill:   new ol.style.Fill({   color: colors[cls]}),
      stroke: new ol.style.Stroke({ color:'#444', width:1})
    });
  });
}
