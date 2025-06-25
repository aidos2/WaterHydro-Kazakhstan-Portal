let chart;
const MAX_DATASETS = 20;

function parseDate(d) {
  const [dd, mm, yyyy] = d.split('.');
  return new Date(`${yyyy}-${mm}-${dd}`);
}

function drawChart(metric, data, watershedNames, selectedId = null) {
  document.getElementById('loadingSpinner')?.classList.remove('d-none');

  setTimeout(() => {
    if (chart) chart.destroy();

    const filtered = selectedId
      ? data.filter(d => d.WATERSHED_ID === selectedId)
      : data;

    const grouped = {};
    filtered.forEach(d => {
      const id = d.WATERSHED_ID;
      grouped[id] = grouped[id] || [];
      grouped[id].push({
        date: d.date,
        value: d[metric] ? parseFloat(d[metric].replace(',', '.')) : null
      });
    });

    const dates = Array.from(new Set(filtered.map(d => d.date)))
      .sort((a, b) => parseDate(a) - parseDate(b));

    const limitedGroups = Object.entries(grouped).slice(0, MAX_DATASETS);

    const datasets = limitedGroups.map(([id, recs], i) => {
      const byDate = recs.reduce((o, r) => (o[r.date] = r.value, o), {});
      return {
        label: watershedNames[id] || id,
        data: dates.map(dt => byDate[dt] ?? null),
        borderColor: `hsl(${(i * 60) % 360},70%,50%)`,
        fill: false,
        tension: 0.1,
        pointRadius: dates.map((_, j) => j === 0 ? 6 : 0)
      };
    });

    chart = new Chart(document.getElementById('chart'), {
      type: 'line',
      data: { labels: dates, datasets },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
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
                return `${label}: ${value}`;
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
            title: { display: true, text: metric }
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
    ds.pointRadius = ds.data.map((_, i) => i === index ? 6 : 0);
  });
  chart.update('none');
}

function exportChartImage() {
  const canvas = document.getElementById('chart');
  chart.update();
  requestAnimationFrame(() => {
    const link = document.getElementById('downloadChart');
    link.href = canvas.toDataURL('image/png');
  });
}

function exportSelectedCSV(data, metric, id) {
  const rows = data
    .filter(d => !id || d.WATERSHED_ID === id)
    .map(d => `${d.date},${d.WATERSHED_ID},${d[metric]?.replace(',', '.') || ''}`);
  const csv = `date,WATERSHED_ID,${metric}\n` + rows.join('\n');
  const blob = new Blob([csv], { type: 'text/csv' });
  document.getElementById('downloadCSV').href =
    URL.createObjectURL(blob);
}

function exportGeoJSONForSelected(feature) {
  const geo = feature.getGeometry().clone().transform('EPSG:3857', 'EPSG:4326');
  const props = { ...feature.getProperties() };
  delete props.geometry;

  const json = {
    type: 'FeatureCollection',
    features: [{
      type: 'Feature',
      properties: props,
      geometry: geo
    }]
  };
  const blob = new Blob([JSON.stringify(json)], { type: 'application/json' });
  document.getElementById('downloadGeoJSON').href =
    URL.createObjectURL(blob);
}

window.drawChart = drawChart;
window.highlightChartPoint = highlightChartPoint;
window.exportChartImage = exportChartImage;
window.exportSelectedCSV = exportSelectedCSV;
window.exportGeoJSONForSelected = exportGeoJSONForSelected;
