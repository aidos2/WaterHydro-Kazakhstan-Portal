/* ================================================================
 *  wbHandler.js – Water Balance Products Mode Handler
 *
 *  Handles basin/combination selection and multi-variable chart
 *  for the 4 target basins (Ertis, Nura, Torgai, Yesil).
 *  Activated when fileSelect = "wb_products".
 * ================================================================ */

/* ---- Basin registry ------------------------------------------- */
const WB_BASINS = [
  { id: 'NWB_00001', name: 'Ertis',  file: 'input_data/new_upload/NWB_00001_ertis.json'  },
  { id: 'NWB_00003', name: 'Nura',   file: 'input_data/new_upload/NWB_00003_nura.json'   },
  { id: 'NWB_00007', name: 'Torgai', file: 'input_data/new_upload/NWB_00007_torgai.json' },
  { id: 'NWB_00009', name: 'Yesil',  file: 'input_data/new_upload/NWB_00009_yesil.json'  },
];

const WB_BASIN_MAP = Object.fromEntries(WB_BASINS.map(b => [b.id, b]));

/* ---- Variable display config ---------------------------------- */
// yAxisID: 'y'  = left axis  (raw fluxes: P, E, Q)
// yAxisID: 'y1' = right axis (derived: P-E, WB storage, GRACE)
const WB_VAR_CONFIG = [
  { key: 'P',             label: 'P – Precipitation (mm/mo)',         color: '#2196F3', dash: [],      yAxisID: 'y'  },
  { key: 'E',             label: 'E – Evapotranspiration (mm/mo)',    color: '#FF5722', dash: [],      yAxisID: 'y'  },
  { key: 'Q',             label: 'Q – Runoff (mm/mo)',                color: '#4CAF50', dash: [],      yAxisID: 'y'  },
  { key: 'PE',            label: 'P−E – Water Availability (mm/mo)', color: '#9C27B0', dash: [6,3],   yAxisID: 'y1' },
  { key: 'WB_storage',    label: 'WB Storage ΔS = P−E−Q (mm/mo)',   color: '#0D47A1', dash: [4,2],   yAxisID: 'y1' },
  { key: 'GRACE_storage', label: 'GRACE Storage – Satellite (mm/mo)',color: '#FF8F00', dash: [10,4],  yAxisID: 'y1' },
];

/* ---- State ---------------------------------------------------- */
window.wbMode      = false;
let wbActiveBasinId = null;   // null = waiting for map click
let wbBasinData     = null;   // full loaded JSON for active basin
let wbComboData     = null;   // selected combination object
let wbChart         = null;

/* ---- Play state ----------------------------------------------- */
let wbPlayInterval = null;
let wbIsPlaying    = false;
let wbPlayIndex    = 0;

const wbEl = id => document.getElementById(id);

/* ================================================================
 *  Public API (called from mapHandler / HTML)
 * ================================================================ */

/** Activate WB Products mode (called when fileSelect → 'wb_products') */
window.activateWBMode = function () {
  window.wbMode = true;

  wbEl('wb-panel').style.display        = '';
  wbEl('controls-panel').style.display  = 'none';

  // Disable legacy time-based controls
  const ts = wbEl('timeSlider');
  const pp = wbEl('playPauseBtn');
  if (ts) ts.disabled = true;
  if (pp) pp.disabled = true;

  // Reset basin display – wait for map click
  wbUpdateBasinNameDisplay(null);
  wbEl('wbComboSelect').innerHTML = '';
  const sliderDate = wbEl('wbSliderDate');
  if (sliderDate) sliderDate.textContent = '--';

  // Update map (shows WB basins in teal)
  if (typeof updateMapStyle === 'function') updateMapStyle();
};

/** Deactivate WB Products mode (called when switching to another dataset) */
window.deactivateWBMode = function () {
  window.wbMode = false;

  wbEl('wb-panel').style.display       = 'none';
  wbEl('controls-panel').style.display = '';

  // Re-enable legacy play controls that activateWBMode disabled
  const ts = wbEl('timeSlider');
  const pp = wbEl('playPauseBtn');
  if (ts) ts.disabled = false;
  if (pp) pp.disabled = false;

  // Stop any running animation
  if (wbIsPlaying) {
    clearInterval(wbPlayInterval);
    wbIsPlaying = false;
    wbPlayIndex = 0;
    const playBtn = wbEl('wbPlayBtn');
    if (playBtn) playBtn.innerHTML = '&#9654; Play';
  }

  if (wbChart) { wbChart.destroy(); wbChart = null; }
  wbActiveBasinId = null;

  // Clear basin selection on map
  if (typeof selectedWatershedIds !== 'undefined') selectedWatershedIds.clear();
  if (typeof updateSelectedWidget  === 'function')  updateSelectedWidget();
};

/** Called when user clicks a WB basin on the map */
window.onWBBasinMapClick = function (basinId) {
  if (!WB_BASIN_MAP[basinId]) return;
  wbActiveBasinId = basinId;
  wbUpdateBasinNameDisplay(basinId);
  wbLoadBasin(basinId);
};

/* ================================================================
 *  Internal – helpers
 * ================================================================ */

/** Update the static "Selected Basin" label in the sidebar */
function wbUpdateBasinNameDisplay (basinId) {
  const el = wbEl('wbBasinName');
  if (!el) return;
  const basin = WB_BASIN_MAP[basinId];
  el.textContent = basin
    ? `${basin.name} — ${basin.id}`
    : 'Click a basin on the map';
}

/** Highlight one time-step on the WB chart (identical to legacy highlightChartPoint) */
function wbHighlightPoint (index) {
  if (!wbChart) return;
  wbChart.data.datasets.forEach(ds => {
    ds.pointRadius = ds.data.map((_, i) => (i === index ? 6 : 0));
  });
  wbChart.update('none');
  const date = wbComboData?.data?.[index]?.date;
  const el = wbEl('wbSliderDate');
  if (el && date) el.textContent = date;
}

/* ================================================================
 *  Internal – data loading
 * ================================================================ */
function wbLoadBasin (basinId) {
  const info = WB_BASIN_MAP[basinId];
  if (!info) return;

  wbEl('wb-loading').style.display = '';
  wbEl('wbComboSelect').innerHTML  = '';

  fetch(info.file)
    .then(r => r.json())
    .then(data => {
      wbBasinData = data;
      wbEl('wb-loading').style.display = 'none';

      // Populate combination selector
      const comboSel = wbEl('wbComboSelect');
      comboSel.innerHTML = data.combinations
        .map((c, i) => `<option value="${i}">${c.label}</option>`)
        .join('');

      // Select first combination
      wbComboData = data.combinations[0];

      wbSyncMapHighlight(basinId);
      wbDrawChart();
      wbUpdateStats();
    })
    .catch(err => {
      console.error('[wbHandler] load error:', err);
      wbEl('wb-loading').style.display = 'none';
    });
}

/* ================================================================
 *  Internal – map sync
 * ================================================================ */
function wbSyncMapHighlight (basinId) {
  if (typeof selectedWatershedIds !== 'undefined') {
    selectedWatershedIds.clear();
    selectedWatershedIds.add(basinId);
  }
  if (typeof updateSelectedWidget === 'function') updateSelectedWidget();
  if (typeof updateMapStyle       === 'function') updateMapStyle();
}

/* ================================================================
 *  Internal – chart drawing
 * ================================================================ */
function wbDrawChart () {
  if (!wbComboData) return;

  // Stop any running animation before redrawing
  if (wbIsPlaying) {
    clearInterval(wbPlayInterval);
    wbIsPlaying = false;
    wbPlayIndex = 0;
    const playBtn = wbEl('wbPlayBtn');
    if (playBtn) playBtn.innerHTML = '&#9654; Play';
  }
  const sliderDate = wbEl('wbSliderDate');
  if (sliderDate) sliderDate.textContent = '--';

  const rows   = wbComboData.data;
  const labels = rows.map(d => d.date);

  const datasets = [];
  WB_VAR_CONFIG.forEach(cfg => {
    const chk = wbEl(`wbShow_${cfg.key}`);
    if (chk && !chk.checked) return;

    datasets.push({
      label:           cfg.label,
      data:            rows.map(d => d[cfg.key]),
      borderColor:     cfg.color,
      backgroundColor: cfg.color + '18',
      borderWidth:     ['WB_storage','GRACE_storage'].includes(cfg.key) ? 2.5 : 2,
      fill:            false,
      tension:         0.15,
      borderDash:      cfg.dash,
      pointRadius:     0,
      pointHoverRadius:5,
      yAxisID:         cfg.yAxisID,
    });
  });

  // Destroy existing chart (both regular + wb)
  if (typeof window.destroyChart === 'function') window.destroyChart();
  if (wbChart) { wbChart.destroy(); wbChart = null; }

  const basin = WB_BASIN_MAP[wbActiveBasinId];
  const combo = wbComboData;

  wbChart = new Chart(wbEl('chart'), {
    type: 'line',
    data: { labels, datasets },
    options: {
      responsive:          true,
      maintainAspectRatio: false,
      interaction: { mode: 'index', intersect: false },
      plugins: {
        title: {
          display: true,
          text: [
            `${basin?.name || wbActiveBasinId}  (${wbActiveBasinId})`,
            combo?.label || ''
          ],
          font:    { size: 13, weight: 'bold' },
          padding: { top: 8, bottom: 4 },
          color:   '#0e1c36'
        },
        legend: {
          position: 'bottom',
          labels:   { font: { size: 11 }, boxWidth: 28, padding: 12 }
        },
        tooltip: {
          callbacks: {
            label: ctx => {
              const v = ctx.raw;
              return `${ctx.dataset.label}: ${v != null ? v.toFixed(2) : 'N/A'}`;
            }
          }
        }
      },
      scales: {
        x: {
          title: { display: true, text: 'Date', font: { size: 11 } },
          ticks: { maxTicksLimit: 18, autoSkip: true, font: { size: 10 } }
        },
        y: {
          type:     'linear',
          position: 'left',
          title: {
            display: true,
            text:    'P, E, Q  (mm/month)',
            font:    { size: 11 }
          },
          grid:  { color: 'rgba(0,0,0,0.06)' },
          ticks: { font: { size: 10 } }
        },
        y1: {
          type:     'linear',
          position: 'right',
          title: {
            display: true,
            text:    'P−E · WB Storage · GRACE  (mm/month)',
            font:    { size: 11 }
          },
          grid:  { drawOnChartArea: false },
          ticks: { font: { size: 10 } }
        }
      }
    }
  });

  window.wbChart = wbChart;

  // Highlight the first data point (same as legacy mode on load)
  wbHighlightPoint(0);
}

/* ================================================================
 *  Internal – stats panel
 * ================================================================ */
function wbUpdateStats () {
  const data = wbComboData?.data;
  if (!data?.length) return;

  const period = `${data[0].date} – ${data[data.length - 1].date}`;

  // Update existing sidebar stat elements
  const statBasins = wbEl('stat-basins');
  const statYears  = wbEl('stat-years');
  const selDiv     = wbEl('selectedBasins');

  if (statBasins) statBasins.textContent = '1';
  if (statYears)  statYears.textContent  = Math.round(data.length / 12);
  if (selDiv)     selDiv.textContent     = `${WB_BASIN_MAP[wbActiveBasinId]?.name || wbActiveBasinId} (${wbActiveBasinId})`;

  // Compute per-variable stats (mean over period)
  const statWb = wbEl('wb-stats');
  if (!statWb) return;

  const mean = key => {
    const vals = data.map(d => d[key]).filter(v => v != null);
    return vals.length ? (vals.reduce((a, b) => a + b, 0) / vals.length).toFixed(1) : '—';
  };

  statWb.innerHTML = `
    <table style="width:100%;font-size:0.75rem;border-collapse:collapse;margin-top:6px;">
      <thead>
        <tr style="background:#f0f3f8;">
          <th style="padding:3px 5px;text-align:left;">Variable</th>
          <th style="padding:3px 5px;text-align:right;">Mean (mm/mo)</th>
        </tr>
      </thead>
      <tbody>
        ${WB_VAR_CONFIG.map(cfg => `
          <tr>
            <td style="padding:2px 5px;">
              <span style="display:inline-block;width:10px;height:10px;
                           border-radius:2px;background:${cfg.color};
                           margin-right:4px;vertical-align:middle;"></span>
              ${cfg.key.replace('_storage','').replace('_',' ')}
            </td>
            <td style="padding:2px 5px;text-align:right;font-weight:600;">${mean(cfg.key)}</td>
          </tr>
        `).join('')}
      </tbody>
    </table>
    <div style="font-size:0.7rem;color:#8a96a8;margin-top:4px;">Period: ${period} · ${data.length} months</div>
  `;
}

/* ================================================================
 *  Event wiring (DOM is ready — scripts load after HTML)
 * ================================================================ */

/* Combination selector */
wbEl('wbComboSelect')?.addEventListener('change', e => {
  const idx = parseInt(e.target.value, 10);
  if (wbBasinData?.combinations?.[idx]) {
    wbComboData = wbBasinData.combinations[idx];
    wbDrawChart();
    wbUpdateStats();
  }
});

/* Variable toggle checkboxes */
WB_VAR_CONFIG.forEach(cfg => {
  wbEl(`wbShow_${cfg.key}`)?.addEventListener('change', () => wbDrawChart());
});

/* Play / Pause button – animates through time steps (identical to legacy mode) */
wbEl('wbPlayBtn')?.addEventListener('click', () => {
  if (!wbComboData?.data?.length) return;

  if (wbIsPlaying) {
    clearInterval(wbPlayInterval);
    wbEl('wbPlayBtn').innerHTML = '&#9654; Play';
    wbIsPlaying = false;
    return;
  }

  wbPlayIndex = 0;
  wbHighlightPoint(0);

  wbPlayInterval = setInterval(() => {
    wbPlayIndex++;
    if (wbPlayIndex < wbComboData.data.length) {
      wbHighlightPoint(wbPlayIndex);
    } else {
      clearInterval(wbPlayInterval);
      wbEl('wbPlayBtn').innerHTML = '&#9654; Play';
      wbIsPlaying = false;
      wbPlayIndex = 0;
    }
  }, 600);

  wbEl('wbPlayBtn').innerHTML = '&#10074;&#10074; Pause';
  wbIsPlaying = true;
});

/* ================================================================
 *  CSV export for WB Products mode
 * ================================================================ */
window.prepareWBCSV = function (link) {
  if (!wbComboData?.data) return;
  const basin = WB_BASIN_MAP[wbActiveBasinId];
  const headers = ['date', 'P', 'E', 'Q', 'PE', 'WB_storage', 'GRACE_storage'];
  const rows = wbComboData.data.map(d =>
    headers.map(k => (d[k] !== null && d[k] !== undefined) ? d[k] : '').join(',')
  );
  const csv = [
    `# Basin: ${basin?.name || wbActiveBasinId} (${wbActiveBasinId})`,
    `# Combination: ${wbComboData.label}`,
    `# Units: mm/month`,
    headers.join(','),
    ...rows
  ].join('\n');
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  link.href = URL.createObjectURL(blob);
  link.download = `${(basin?.name || wbActiveBasinId).toLowerCase()}_${wbComboData.key}.csv`;
};
