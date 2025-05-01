let chart;

function drawChart(metric, data, watershedNames, selectedId = null) {
  if (chart) chart.destroy();

  const filtered = selectedId
    ? data.filter(d => d.WATERSHED_ID === selectedId)
    : data;

  const grouped = {};
  filtered.forEach(d => {
    grouped[d.WATERSHED_ID] = grouped[d.WATERSHED_ID] || [];
    grouped[d.WATERSHED_ID].push({
      date: d.date,
      value: parseFloat(d[metric].replace(',', '.'))
    });
  });

  const dates = Array.from(new Set(filtered.map(d => d.date)))
    .sort((a, b) =>
      new Date(a.split('.').reverse().join('-')) -
      new Date(b.split('.').reverse().join('-'))
    );

  const datasets = Object.entries(grouped).map(([id, recs], i) => {
    const byDate = recs.reduce((o, r) => (o[r.date] = r.value, o), {});
    return {
      label: watershedNames[id] || id,
      data: dates.map(dt => byDate[dt] ?? null),
      borderColor: `hsl(${(i*60)%360},70%,50%)`,
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
      plugins: { legend: { position: 'bottom' } },
      scales: {
        x: { title: { display: true, text: 'Date' } },
        y: { title: { display: true, text: metric } }
      }
    }
  });
}

function highlightChartPoint(index) {
  if (!chart) return;
  chart.data.datasets.forEach(ds => {
    ds.pointRadius = ds.data.map((_, i) => i === index ? 6 : 0);
  });
  chart.update('none');
}

function exportChartImage() {
  const link = document.getElementById('downloadChart');
  link.href = document.getElementById('chart').toDataURL();
}

function exportSelectedCSV(data, metric, id) {
  const rows = data
    .filter(d => !id || d.WATERSHED_ID === id)
    .map(d => `${d.date},${d.WATERSHED_ID},${d[metric].replace(',', '.')}`);
  const csv = `date,WATERSHED_ID,${metric}\n` + rows.join('\n');
  const blob = new Blob([csv], { type: 'text/csv' });
  document.getElementById('downloadCSV').href =
    URL.createObjectURL(blob);
}

function exportGeoJSONForSelected(feature) {
  const geo = feature.getGeometry()
    .clone().transform('EPSG:3857','EPSG:4326');
  const json = {
    type: 'FeatureCollection',
    features: [{
      type: 'Feature',
      properties: feature.getProperties(),
      geometry: geo
    }]
  };
  const blob = new Blob(
    [JSON.stringify(json)], { type: 'application/json' }
  );
  document.getElementById('downloadGeoJSON').href =
    URL.createObjectURL(blob);
}

window.drawChart = drawChart;
window.highlightChartPoint = highlightChartPoint;
window.exportChartImage = exportChartImage;
window.exportSelectedCSV = exportSelectedCSV;
window.exportGeoJSONForSelected = exportGeoJSONForSelected;
