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

const basinColorMap = {}; // basin id -> color

function getColorForBasin(id) {
  if (!basinColorMap[id]) {
    const idx = Object.keys(basinColorMap).length % BASIN_COLORS.length;
    basinColorMap[id] = BASIN_COLORS[idx];
  }
  return basinColorMap[id];
}

function exportChartImage() {
  const activeChart = window.wbChart;
  if (!activeChart) return null;
  const canvas = document.getElementById('chart');
  activeChart.update();
  return canvas.toDataURL('image/png');
}

/* -------------------- DOWNLOAD CHART ----------------------- */
document.getElementById("downloadChart").addEventListener("click", (e) => {
  if (!window.wbChart) {
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

  const link = e.currentTarget;
  link.href = url;
  link.download = "chart.png";
});

/* -------------------- DOWNLOAD CSV -------------------------- */
document.getElementById("downloadCSV").addEventListener("click", (e) => {
  if (typeof window.prepareWBCSV !== 'function' || !window.wbHasData?.()) {
    e.preventDefault();
    alert("Data not loaded yet.");
    return;
  }
  window.prepareWBCSV(e.currentTarget);
});

window.getColorForBasin = getColorForBasin;
window.exportChartImage = exportChartImage;
