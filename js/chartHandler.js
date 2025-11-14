let chart;
const MAX_DATASETS = 20;
const UNIT_LABEL = 'mm/month'; // все метрики в mm/month

// ColorBrewer-style qualitative palette (Dark2 + Set3)
const BASIN_COLORS = [
  // Dark2 (8)
  '#1b9e77','#d95f02','#7570b3','#e7298a',
  '#66a61e','#e6ab02','#a6761d','#666666',
  // Set3 (12)
  '#8dd3c7','#ffffb3','#bebada','#fb8072',
  '#80b1d3','#fdb462','#b3de69','#fccde5',
  '#d9d9d9','#bc80bd','#ccebc5','#ffed6f'
];

const basinColorMap = {}; // WATERSHED_ID -> color

function getColorForBasin(id) {
  if (!basinColorMap[id]) {
    const idx = Object.keys(basinColorMap).length % BASIN_COLORS.length;
    basinColorMap[id] = BASIN_COLORS[idx];
  }
  return basinColorMap[id];
}

function parseDate(d) {
  const [dd, mm, yyyy] = d.split('.');
  return new Date(`${yyyy}-${mm}-${dd}`);
}

function drawChart(metric, data, watershedNames, selectedId = null) {
  document.getElementById('loadingSpinner')?.classList.remove('d-none');

  // сохраняем текущие данные и метрику глобально для экспорта CSV
  window.latestData = data;
  window.selectedMetric = metric;

  setTimeout(() => {
    if (chart) chart.destroy();

    // Если mapHandler уже отфильтровал по выбранным бассейнам – просто используем data
    const filtered = selectedId
      ? data.filter(d => d.WATERSHED_ID === selectedId)
      : data;

    const grouped = {};
    filtered.forEach(d => {
      const id = d.WATERSHED_ID;
      if (!id) return;
      grouped[id] = grouped[id] || [];
      grouped[id].push({
        date: d.date,
        value: d[metric] ? parseFloat(String(d[metric]).replace(',', '.')) : null
      });
    });

    const dates = Array.from(new Set(filtered.map(d => d.date)))
      .sort((a, b) => parseDate(a) - parseDate(b));

    const limitedGroups = Object.entries(grouped).slice(0, MAX_DATASETS);

    // Мультивыбор из mapHandler.js (Set), если он есть
    const multiSelection =
      typeof selectedWatershedIds !== 'undefined' &&
      selectedWatershedIds instanceof Set
        ? selectedWatershedIds
        : null;

    const datasets = limitedGroups.map(([id, recs]) => {
      const byDate = recs.reduce((o, r) => (o[r.date] = r.value, o), {});
      const isSelectedMulti = multiSelection ? multiSelection.has(id) : false;
      const isSelectedSingle = selectedId && id === selectedId;
      const isHighlighted = isSelectedMulti || isSelectedSingle;

      const color = getColorForBasin(id);

      return {
        label: watershedNames[id] || id,
        data: dates.map(dt => byDate[dt] ?? null),
        borderColor: color,
        backgroundColor: color,
        borderWidth: isHighlighted ? 3 : 1.5,
        fill: false,
        tension: 0.1,
        pointRadius: dates.map((_, j) => (j === 0 ? 6 : 0)),
        pointHoverRadius: 5
      };
    });

    const titleText = metric
      ? `${metric} (${UNIT_LABEL}) – Time Series`
      : 'Time Series';

    chart = new Chart(document.getElementById('chart'), {
      type: 'line',
      data: { labels: dates, datasets },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          title: {
            display: true,
            text: titleText,
            font: {
              size: 14,
              weight: 'bold'
            },
            padding: {
              top: 8,
              bottom: 8
            }
          },
          legend: {
            position: 'bottom',
            onClick: (e, legendItem, legend) => {
              const index = legendItem.datasetIndex;
              const ci = legend.chart;
              const meta = ci.getDatasetMeta(index);
              meta.hidden = !meta.hidden;
              ci.update();
            }
          },
          tooltip: {
            mode: 'index',
            intersect: false,
            callbacks: {
              label: context => {
                const label = context.dataset.label || '';
                const value = context.raw != null ? context.raw.toFixed(2) : 'N/A';
                return `${label}: ${value} ${UNIT_LABEL}`;
              }
            }
          },
          zoom: {
            pan: {
              enabled: true,
              mode: 'x',
              modifierKey: 'ctrl'
            },
            zoom: {
              wheel: { enabled: true },
              pinch: { enabled: true },
              mode: 'x'
            }
          }
        },
        scales: {
          x: {
            title: { display: true, text: 'Date' },
            ticks: {
              maxTicksLimit: 20,
              autoSkip: true
            }
          },
          y: {
            title: {
              display: true,
              text: `${metric} (${UNIT_LABEL})`
            }
          }
        }
      }
    });

    document.getElementById('loadingSpinner')?.classList.add('d-none');
  }, 50);
}

function highlightChartPoint(index) {
  if (!chart) return;
  chart.data.datasets.forEach(ds => {
    ds.pointRadius = ds.data.map((_, i) => (i === index ? 6 : 0));
  });
  chart.update('none');
}

function exportChartImage() {
  if (!chart) return null;
  const canvas = document.getElementById('chart');
  chart.update(); // обновить, чтобы заголовок точно был на PNG
  return canvas.toDataURL('image/png');
}

function exportSelectedCSV(data, metric, id) {
  const rows = data
    .filter(d => !id || d.WATERSHED_ID === id)
    .map(d => `${d.date},${d.WATERSHED_ID},${(d[metric] || '').toString().replace(',', '.')}`);
  const csv = `date,WATERSHED_ID,${metric}\n` + rows.join('\n');
  const blob = new Blob([csv], { type: 'text/csv' });
  const link = document.getElementById('downloadCSV');
  link.href = URL.createObjectURL(blob);
  link.download = 'timeseries.csv';
}

function exportGeoJSONForSelected() {
  // selectedFeature и ol.* – из mapHandler.js / OpenLayers
  if (typeof selectedFeature === 'undefined' || !selectedFeature) {
    alert('No watershed selected.');
    return;
  }

  const feature = selectedFeature;
  const geom = feature.getGeometry().clone().transform('EPSG:3857', 'EPSG:4326');
  const props = { ...feature.getProperties() };
  delete props.geometry;

  const json = {
    type: 'FeatureCollection',
    features: [{
      type: 'Feature',
      properties: props,
      geometry: new ol.format.GeoJSON().writeGeometryObject(geom)
    }]
  };

  const blob = new Blob([JSON.stringify(json)], { type: 'application/json' });
  const link = document.getElementById('downloadGeoJSON');
  link.href = URL.createObjectURL(blob);
  link.download = 'selected_watershed.geojson';
}

/* -------------------- DOWNLOAD CHART ----------------------- */
document.getElementById("downloadChart").addEventListener("click", (e) => {
  if (!chart) {
    e.preventDefault();
    alert("Chart not ready yet.");
    return;
  }

  const url = exportChartImage();
  if (!url) {
    e.preventDefault();
    alert("Failed to export chart.");
    return;
  }

  // не блокируем дефолт, просто даём браузеру перейти по href=blob
  const link = e.currentTarget;
  link.href = url;
  link.download = "chart.png";
});

/* -------------------- DOWNLOAD CSV -------------------------- */
document.getElementById("downloadCSV").addEventListener("click", (e) => {
  // если данных нет – блокируем клик
  if (!window.latestData || !window.selectedMetric) {
    e.preventDefault();
    alert("Select dataset and metric first.");
    return;
  }

  // генерируем Blob и обновляем href; дефолтное поведение ссылки всё сделает
  exportSelectedCSV(window.latestData, window.selectedMetric, null);
});


/* --------- Экспортируем функции для mapHandler.js ------------------ */

window.drawChart = drawChart;
window.highlightChartPoint = highlightChartPoint;
window.exportChartImage = exportChartImage;
window.exportSelectedCSV = exportSelectedCSV;
