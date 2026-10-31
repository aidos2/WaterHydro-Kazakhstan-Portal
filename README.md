# WaterBalance Kazakhstan Portal

> **Open Data GIS Platform for Water Resources of Northern Kazakhstan**
> Developed by [National Laboratory Astana](https://nla.nu.edu.kz/) · Nazarbayev University

[![Live Portal](https://img.shields.io/badge/Live%20Portal-waterbalance.org.kz-0e1c36?style=flat-square&logo=globe)](https://aidos2.github.io/WaterHydro-Kazakhstan-Portal/)
[![GitHub Pages](https://img.shields.io/badge/Hosted%20on-GitHub%20Pages-181717?style=flat-square&logo=github)](https://aidos2.github.io/WaterHydro-Kazakhstan-Portal/)
[![License: MIT](https://img.shields.io/badge/License-MIT-c9a84c?style=flat-square)](LICENSE)
[![Languages](https://img.shields.io/badge/Languages-EN%20%7C%20RU%20%7C%20KZ-4caf50?style=flat-square)](#)

---

## Overview

**WaterBalance Kazakhstan Portal** is a trilingual (EN / RU / KZ) open geospatial web platform that integrates, analyzes, and visualizes hydrological and remote-sensing data for Northern Kazakhstan.

The portal was developed under the grant-funded project:

> *"Water Balance of Northern Kazakhstan's Water Management Basins Estimated Using Remote Sensing, Global Datasets, and Hydrological Information"*
> — Ministry of Science and Higher Education of the Republic of Kazakhstan

---

## Live Demo

| URL | Description |
|-----|-------------|
| [waterbalance.org.kz](https://aidos2.github.io/WaterHydro-Kazakhstan-Portal/) | Primary domain (GitHub Pages) |
| [nla.nu.edu.kz — Project Page](https://nla.nu.edu.kz/tpost/9p3vmfjdp1-the-water-balance-of-northern-kazakhstan) | Official NLA project description |

---

## Portal Pages

| Page | EN | RU | KZ | Description |
|------|----|----|-----|-------------|
| Home | `index.html` | `index_ru.html` | `index_kz.html` | Landing page with feature cards, project overview, and related publications |
| Story Map | `story.html` | `story_ru.html` | `story_kz.html` | ArcGIS StoryMaps-style project story: idea → team → field work → conferences → seminar → map tour of the portal sections |
| Spatial Data Catalogue | `spatialData.html` | `spatialData_ru.html` | `spatialData_kz.html` | Searchable table with direct dataset downloads (including WB Products) |
| LULC Map | `lulc_map.html` | `lulc_map_ru.html` | `lulc_map_kz.html` | Full-screen ArcGIS Experience Builder map |
| Water Timeseries Dashboard | `timeseries.html` | `timeseries_ru.html` | `timeseries_kz.html` | Interactive choropleth map + time-series charts + Water Balance Products mode |
| Water Use & Abstraction Dashboard | `water_use.html` | `water_use_ru.html` | `water_use_kz.html` | Water withdrawal, use, discharge and losses by basin and sector, 2004–2023 (generated from `notebooks/water_use_dashboard.ipynb`) |

---

## Features

### Core

- **Trilingual interface** — full EN / RU / KZ support across all pages
- **Interactive choropleth map** — basin-level visualization of precipitation, ET, and soil moisture with time animation
- **Time animation (Play/Pause)** — step through monthly snapshots, highlight chart point in sync
- **Basin statistics panel** — live MAX / MIN / MEAN with dates, basin count, year range
- **Multi-dataset selection** — switch between GLEAM Water Balance, MSWEP Precipitation, ERA5 Soil Moisture
- **Multi-basin selection** — click to toggle individual basins; chart updates instantly
- **Full-screen LULC map** — ESA WorldCover 100 m rendered via ArcGIS Experience Builder
- **Spatial Data Catalogue** — searchable table with direct downloads in 7 formats
- **Chart export** — download chart as PNG; download displayed data as CSV
- **NLA-styled UI** — dark navy `#0e1c36`, gold `#c9a84c`, Roboto Condensed — mirrors [nla.nu.edu.kz](https://nla.nu.edu.kz/) branding
- **Custom domain ready** — `CNAME` configured for `waterbalance.org.kz`

### Water Balance Products Mode

A dedicated mode covering **all 14 watersheds** of Kazakhstan (10 northern, 4 southern) with combined multi-variable analysis (P · E · Q · P−E · WB Storage ΔS · GRACE Storage).

- **27 P×E×Q combinations** per basin (3 precipitation × 3 evapotranspiration × 3 runoff products):
  - **P:** ERA5BC · MSWEP v2.8 · MSWEP v3.16
  - **E:** GLEAM v4.2a · GLEAM v4.3a · PML v2.2c
  - **Q:** ERA5 · ERA5-Land · WaterGAP v2.2e
- **P / E / Q product selectors** — pick each product independently; the choice is kept when switching basins
- **Dual-axis chart** — P / E / Q on left axis; P−E / WB Storage / GRACE on right axis
- **Variable toggles** — show/hide individual variables on the chart
- **Basin selection via map click** — click any teal-highlighted basin to load its data
- **Play animation** — animate through 252 monthly timesteps in sync with chart point highlighting
- **Period** — P/E/Q and derived terms Oct 2002–Nov 2022; GRACE storage Oct 2002–Sep 2023
- **CSV export** — downloads all 7 variables for the selected basin and combination with metadata header
- **PNG export** — downloads the chart as a high-quality image

---

## Related Publications & Data

| Type | Title | Link |
|------|-------|-------|
| Dataset | The watershed boundaries of large river and water management basins of Kazakhstan | [Zenodo · 2025](https://zenodo.org/records/17077776) |
| Article | Baseline information and regionalization of the large river basins of Kazakhstan | [Frontiers in Water · 2025](https://doi.org/10.3389/frwa.2025.1601671) |
| Article | Analysing Seasonal Hydroclimatic Variability to Support Managed Aquifer Recharge Planning in Kazakhstan | [Earth Systems and Environment · 2026](https://doi.org/10.1007/s41748-026-01101-x) |
| Opinion Paper | The paradoxes of adaptation to climate change in Central Asia | [Central Asian Journal of Water Research · 2026](https://water-ca.org/article/the-paradoxes-of-adaption-to-climate-change-in-central-asia) |

Authors: Yapiyev V., Ongdas N., Saidaliyeva Z., Zhiyenbek A., Smogulova T., Baigaliyeva M., Prikaziuk E., Mukanov Y., Sallwey J., Stefan C.

---

## Datasets

### Spatial Layers (Vector)

| Dataset | Formats |
|---------|---------|
| All Watersheds (WGS84) | GeoJSON · GeoPackage · Shapefile |
| Water Management Basins | GeoJSON · GeoPackage · Shapefile |
| Sub-Basins | GeoJSON · GeoPackage · Shapefile |
| Hydro Region Boundaries | GeoJSON · GeoPackage · Shapefile |
| River Network (GIRES v10) | GeoJSON · GeoPackage · Shapefile |
| Lakes & Water Bodies | GeoJSON · GeoPackage · Shapefile |

### Raster Layers

| Dataset | Resolution | Formats |
|---------|-----------|---------|
| ESA WorldCover 2020 (LULC) | 100 m | GeoTIFF · WMTS |

### Water Use & Abstraction (5 water management basins, 2004–2023)

Source notebook: [`notebooks/water_use_dashboard.ipynb`](notebooks/water_use_dashboard.ipynb) — it loads the basin water-use statistics, validates them, converts **thousand m³ → mln m³**, groups the 21 water-use types into 9 sectors, joins the data to `Water management basins.geojson` (`BASIN_ID`), analyses the key indicators with interactive Plotly figures, and exports the dashboard data.

| File | Content |
|------|---------|
| `input_data/water_use/wateruse_masterTable.xlsx` | Input: basin × type × year statistics (thousand m³) |
| `input_data/water_use/water_use_dashboard.json` | Notebook output read by `water_use*.html` (trilingual labels, 20-year arrays, mln m³) |
| `input_data/water_use/water_use_tidy.csv` | Notebook output: tidy long table, mln m³ |
| `input_data/water_use/water_use_tables.xlsx` | Notebook output: tidy data, basin/sector totals, efficiency, trends |
| `notebooks/water_use_dashboard.html` | Executed notebook exported to HTML (static report) |

Covered basins: Ertis (`WMB_00006`), Yesil (`WMB_00005`), Nura-Sarysu (`WMB_00004`), Tobyl-Torgai (`WMB_00001`), Zhaiyk-Caspian (`WMB_00008`).
Dashboard: basin choropleth (click to filter), year slider/play, indicator & sector filters, KPI tiles, time series by basin/sector/type, sector structure, intake by source, efficiency and loss rate, basin × year matrix, CSV export.

Rebuild after editing the master table (Anaconda / any Python with pandas, plotly, openpyxl, shapely, nbconvert):

```bash
cd notebooks
jupyter nbconvert --to notebook --execute --inplace water_use_dashboard.ipynb
jupyter nbconvert --to html water_use_dashboard.ipynb
```

### Legacy Time-Series Data (all basins, aggregated per basin)

| Dataset | Variable | Period | Formats |
|---------|----------|--------|---------|
| MSWEP | Precipitation | Monthly | JSON · CSV · Excel |
| ERA5-Land | Soil Moisture (0–100 cm, 0–289 cm) | Monthly | JSON · CSV · Excel |
| GLEAM | Evapotranspiration · Water Balance | Monthly | JSON · CSV · Excel |

### Water Balance Products (all 14 basins, 27 combinations each)

Source: `total_basin_wb_ts` — 378 Excel files (14 basins × 27 P×E×Q combinations), monthly, mm/month.
P/E/Q (and P−E, ΔS) cover Oct 2002–Nov 2022; GRACE storage covers Oct 2002–Sep 2023.

| Basin | ID | File stem |
|-------|----|-----------|
| Ertis (Irtysh) | NWB_00001 | `NWB_00001_ertis` |
| Esil-Ertis closed | NWB_00002 | `NWB_00002_yesil_ertis_closed_basin` |
| Nura | NWB_00003 | `NWB_00003_nura` |
| Ob-Ertis closed | NWB_00004 | `NWB_00004_ob_ertis_closed_basin` |
| Sarysu | NWB_00005 | `NWB_00005_sarysu` |
| Tobyl | NWB_00006 | `NWB_00006_tobyl` |
| Torgai | NWB_00007 | `NWB_00007_torgai` |
| Vagay | NWB_00008 | `NWB_00008_vagay` |
| Yesil (Ishim) | NWB_00009 | `NWB_00009_yesil` |
| Zhaiyk-Caspian | NWB_00010 | `NWB_00010_zhaiyk_caspian` |
| Syr Darya-Aral | SWB_00001 | `SWB_00001_syr_darya_aral` |
| Ily-Balkhash-Alakol | SWB_00002 | `SWB_00002_ily_balkhash_alakol` |
| Shu-Talas | SWB_00003 | `SWB_00003_shu_talas` |
| Amu Darya-Aral | SWB_00004 | `SWB_00004_amu_darya_aral` |

Each basin is published in `input_data/wb_products/` as:

| Folder | Content | Format |
|--------|---------|--------|
| `json/<stem>.json` | All 27 combinations (used by the dashboard) | JSON |
| `csv/<stem>.csv` | All 27 combinations, long format (`basin_id, basin_name, date, P_product, E_product, Q_product, P, E, Q, PE, WB_storage, GRACE_storage`) | CSV |
| `xlsx/<stem>/*.xlsx` | Original Excel file per combination | Excel |
| `zip/<stem>_xlsx.zip` | The 27 Excel files of one basin | ZIP |
| `zip/wb_products_all_basins.zip` | All 378 Excel files, one folder per basin | ZIP |

Each WB Products JSON contains: `basin_id`, `basin_name`, `units`, and `combinations[]` — each combination has a `key`, `label`, `p_key`/`e_key`/`q_key`, `p_label`/`e_label`/`q_label`, `source_file`, and `data[]` with monthly records of `date`, `P`, `E`, `Q`, `PE`, `WB_storage`, `GRACE_storage` (`null` where no value).

---

## Tech Stack

| Component | Technology |
|-----------|-----------|
| Frontend | HTML5 · CSS3 · JavaScript (ES6+) |
| UI Framework | Bootstrap 5.3 |
| Mapping | OpenLayers 6 · ArcGIS Experience Builder |
| Charts | Chart.js 4 |
| Chart interaction | chartjs-plugin-zoom 2.0 + Hammer.js 2.0 (scroll zoom · Ctrl+drag pan) |
| Styling | Custom NLA theme (`style/nla-theme.css`) — Roboto Condensed via Google Fonts |
| Hosting | GitHub Pages |
| Custom Domain | `waterbalance.org.kz` (CNAME) |

---

## Project Structure

```
WaterHydro-Kazakhstan-Portal/
│
├── index.html                   # Home – English
├── index_ru.html                # Home – Russian
├── index_kz.html                # Home – Kazakh
│
├── spatialData.html             # Data Catalogue – EN
├── spatialData_ru.html          # Data Catalogue – RU
├── spatialData_kz.html          # Data Catalogue – KZ
│
├── lulc_map.html                # LULC Map – EN
├── lulc_map_ru.html             # LULC Map – RU
├── lulc_map_kz.html             # LULC Map – KZ
│
├── timeseries.html              # Timeseries Dashboard – EN
├── timeseries_ru.html           # Timeseries Dashboard – RU
├── timeseries_kz.html           # Timeseries Dashboard – KZ
│
├── story.html                   # Story Map – EN (story_ru.html, story_kz.html)
├── water_use.html               # Water Use & Abstraction Dashboard – EN
├── water_use_ru.html            # Water Use & Abstraction Dashboard – RU
├── water_use_kz.html            # Water Use & Abstraction Dashboard – KZ
│
├── notebooks/
│   ├── water_use_dashboard.ipynb  # SOURCE: water use analysis + dashboard data export
│   └── water_use_dashboard.html   # executed notebook report
│
├── style/
│   ├── nla-theme.css            # Shared NLA-style theme (navbar, cards, pub-cards, footer)
│   ├── style.css                # Map/chart dashboard layout styles
│   ├── water-use.css            # Water Use dashboard layout
│   └── story.css                # Story Map layout
│
├── js/
│   ├── chartHandler.js          # Chart.js rendering, CSV/PNG export, play-highlight bridge
│   ├── wbHandler.js             # Water Balance Products mode (basin loading, dual-axis chart, play, CSV)
│   ├── waterUseHandler.js       # Water Use dashboard (map, filters, charts, i18n)
│   ├── storyMap.js              # Story Map (scroll-driven slides, map tour)
│   ├── visitorCounter.js        # Footer visit counter (GoatCounter)
│   └── mapHandler.js            # OpenLayers map, choropleth, time slider, basin selection
│
├── assets/
│   └── ol/                      # OpenLayers library (local, offline-capable)
│
├── image_logo/
│   ├── logo_lulc.svg            # LULC card illustration
│   ├── logo_timeseries.svg      # Timeseries card illustration
│   ├── logo_wateruse.svg        # Water Use card illustration
│   ├── irtysh_bg.jpg            # Background image (Irtysh River, 236 KB web copy)
│   ├── Irtysh 1.png             # Original background (31 MB, not loaded by pages)
│   └── story/                   # Story Map photos (order follows the project story document)
│
├── input_data/
│   ├── ALL_watersheds_wgs84.*   # Watershed boundaries (GeoJSON / GeoPackage / ZIP)
│   ├── Water management basins.*
│   ├── watershed_subbasins.*
│   ├── Hydro Region Boundry.*
│   ├── River network GIRES_v10.*
│   ├── lakes.*
│   ├── ESA_WorldCover_100m.tif
│   ├── P_MSWEP_ALL.*            # Precipitation time series (JSON / CSV / Excel)
│   ├── Soil_Moisture_ERA5.*     # Soil moisture time series
│   ├── GLEAM_WaterBalanceAllBAsin.*  # Water balance time series
│   │
│   ├── wb_products/             # Water Balance Products (14 basins × 27 combinations)
│   │   ├── json/                # <ID>_<basin>.json – dashboard data, all combinations
│   │   ├── csv/                 # <ID>_<basin>.csv – long-format table
│   │   ├── xlsx/<ID>_<basin>/   # original Excel files (27 per basin)
│   │   └── zip/                 # Excel bundles per basin + all basins
│   └── water_use/               # Water use statistics (input) + notebook outputs
│
├── CNAME                        # Custom domain: waterbalance.org.kz
├── LICENSE
└── README.md
```

---

## Visitor Counter

Every page loads `js/visitorCounter.js`, which counts the visit with [GoatCounter](https://www.goatcounter.com) (no cookies, no personal data) and shows the site total in the footer.
Setup: create a GoatCounter site with code `waterbalance` (or change `GC_CODE` in the script) and enable **Settings → Allow adding visitor counts on your website**. Local copies (`localhost`, `file://`) are not counted.

---

## Local Development

**Clone the repository:**
```bash
git clone https://github.com/aidos2/WaterHydro-Kazakhstan-Portal.git
cd WaterHydro-Kazakhstan-Portal
```

**Run a local server:**
```bash
# Python
python -m http.server 8000

# Node.js (npx)
npx serve .
```
Then open [http://localhost:8000](http://localhost:8000)

> **Note:** A local server is required because the app fetches GeoJSON/JSON files via `fetch()`. Opening `index.html` directly as a `file://` URL will block these requests due to browser CORS policy.

---

## WB Products JSON Schema

```json
{
  "basin_id": "NWB_00003",
  "basin_name": "Nura",
  "units": "mm/month",
  "combinations": [
    {
      "key": "era5bc__gleam_v_4_2_a__era5",
      "p_key": "era5bc", "e_key": "gleam_v_4_2_a", "q_key": "era5",
      "p_label": "ERA5BC", "e_label": "GLEAM v4.2a", "q_label": "ERA5",
      "label": "P: ERA5BC | E: GLEAM v4.2a | Q: ERA5",
      "source_file": "xlsx/NWB_00003_nura/nura_P-ET-Q_P_era5bc_ET_gleam_v_4_2_a_Q_era5.xlsx",
      "data": [
        {
          "date": "31.10.2002",
          "P": 13.5427,
          "E": 20.2044,
          "Q": 0.0915,
          "PE": -6.6617,
          "WB_storage": -6.7532,
          "GRACE_storage": -2.8805
        }
      ]
    }
  ]
}
```

Variables: `P` = precipitation, `E` = evapotranspiration, `Q` = runoff, `PE` = P−E (water availability), `WB_storage` = P−E−Q (storage change), `GRACE_storage` = satellite-derived terrestrial water storage anomaly. All units: **mm/month**.

---

## Citation

```
WaterBalance Kazakhstan Portal (2025).
Open Data GIS Platform for Hydrological Analysis of Northern Kazakhstan.
National Laboratory Astana, Nazarbayev University.
Ministry of Science and Higher Education of the Republic of Kazakhstan.
URL: https://waterbalance.org.kz
```

---

## Contact

| Role | Name / Email |
|------|-------------|
| Project Manager | [vyapiyev@nu.edu.kz](mailto:vyapiyev@nu.edu.kz) |
| Developer / GIS Specialist | [aidos_makhanov@gmail.com](mailto:aidos_makhanov@gmail.com) |
| Institution | [National Laboratory Astana](https://nla.nu.edu.kz/) · Nazarbayev University |

---

## License

[MIT License](LICENSE) — free to reuse and modify with attribution.

---

<div align="center">
  <sub>© 2025 National Laboratory Astana · waterbalance.org.kz</sub>
</div>
