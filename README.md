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
| Spatial Data Catalogue | `spatialData.html` | `spatialData_ru.html` | `spatialData_kz.html` | Searchable table with direct dataset downloads (including WB Products) |
| LULC Map | `lulc_map.html` | `lulc_map_ru.html` | `lulc_map_kz.html` | Full-screen ArcGIS Experience Builder map |
| Water Timeseries Dashboard | `timeseries.html` | `timeseries_ru.html` | `timeseries_kz.html` | Interactive choropleth map + time-series charts + Water Balance Products mode |

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

A dedicated mode for the 4 key Northern Kazakhstan basins with combined multi-variable analysis:

| Basin | ID | Variables |
|-------|----|-----------|
| Ertis (Irtysh) | NWB_00001 | P · E · Q · P−E · WB Storage ΔS · GRACE Storage |
| Nura | NWB_00003 | P · E · Q · P−E · WB Storage ΔS · GRACE Storage |
| Torgai | NWB_00007 | P · E · Q · P−E · WB Storage ΔS · GRACE Storage |
| Yesil (Ishim) | NWB_00009 | P · E · Q · P−E · WB Storage ΔS · GRACE Storage |

- **12 P×E×Q combinations** per basin (2 precipitation sources × 3 evapotranspiration sources × 2 runoff sources)
- **Dual-axis chart** — P / E / Q on left axis; P−E / WB Storage / GRACE on right axis
- **Variable toggles** — show/hide individual variables on the chart
- **Basin selection via map click** — click a teal-highlighted basin to load its data
- **Play animation** — animate through 252 monthly timesteps (Oct 2002–Sep 2023) in sync with chart point highlighting
- **CSV export** — downloads all 7 variables for the selected basin and combination with metadata header
- **PNG export** — downloads the chart as a high-quality image

---

## Related Publications & Data

| Type | Title | Link |
|------|-------|-------|
| Dataset | The watershed boundaries of large river and water management basins of Kazakhstan | [Zenodo · 2025](https://zenodo.org/records/17077776) |
| Article | Baseline information and regionalization of the large river basins of Kazakhstan | [Frontiers in Water · 2025](https://doi.org/10.3389/frwa.2025.1601671) |
| Article | Analysing Seasonal Hydroclimatic Variability to Support Managed Aquifer Recharge Planning in Kazakhstan | [Earth Systems and Environment · 2026](https://doi.org/10.1007/s41748-026-01101-x) |

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

### Legacy Time-Series Data (all basins, aggregated per basin)

| Dataset | Variable | Period | Formats |
|---------|----------|--------|---------|
| MSWEP | Precipitation | Monthly | JSON · CSV · Excel |
| ERA5-Land | Soil Moisture (0–100 cm, 0–289 cm) | Monthly | JSON · CSV · Excel |
| GLEAM | Evapotranspiration · Water Balance | Monthly | JSON · CSV · Excel |

### Water Balance Products (4 key basins, per-combination)

| Basin | ID | Period | Combinations | Format |
|-------|----|--------|-------------|--------|
| Ertis | NWB_00001 | Oct 2002–Sep 2023 | 12 (P×E×Q) | JSON |
| Nura | NWB_00003 | Oct 2002–Sep 2023 | 12 (P×E×Q) | JSON |
| Torgai | NWB_00007 | Oct 2002–Sep 2023 | 12 (P×E×Q) | JSON |
| Yesil | NWB_00009 | Oct 2002–Sep 2023 | 12 (P×E×Q) | JSON |

Each WB Products JSON contains: `basin_id`, `basin_name`, and `combinations[]` — each combination has a `key`, `label`, `p_label`, `e_label`, `q_label`, and `data[]` with monthly records of `date`, `P`, `E`, `Q`, `PE`, `WB_storage`, `GRACE_storage`.

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
├── Report Water Use Analysis.html  # Jupyter Notebook export (water use)
│
├── style/
│   ├── nla-theme.css            # Shared NLA-style theme (navbar, cards, pub-cards, footer)
│   └── style.css                # Map/chart dashboard layout styles
│
├── js/
│   ├── chartHandler.js          # Chart.js rendering, CSV/PNG export, play-highlight bridge
│   ├── wbHandler.js             # Water Balance Products mode (basin loading, dual-axis chart, play, CSV)
│   └── mapHandler.js            # OpenLayers map, choropleth, time slider, basin selection
│
├── assets/
│   └── ol/                      # OpenLayers library (local, offline-capable)
│
├── image_logo/
│   ├── logo_lulc.svg            # LULC card illustration
│   ├── logo_timeseries.svg      # Timeseries card illustration
│   ├── logo_wateruse.svg        # Water Use card illustration
│   └── Irtysh 1.png             # Background image (Irtysh River)
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
│   └── new_upload/              # Water Balance Products (per-basin JSON)
│       ├── NWB_00001_ertis.json
│       ├── NWB_00003_nura.json
│       ├── NWB_00007_torgai.json
│       └── NWB_00009_yesil.json
│
├── CNAME                        # Custom domain: waterbalance.org.kz
├── LICENSE
└── README.md
```

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
  "basin_id": "NWB_00001",
  "basin_name": "Ertis",
  "combinations": [
    {
      "key": "MSWEP_GLEAM_R_GLEAM",
      "label": "P: MSWEP | E: GLEAM | Q: GLEAM Runoff",
      "p_label": "MSWEP",
      "e_label": "GLEAM",
      "q_label": "GLEAM Runoff",
      "data": [
        {
          "date": "2002-10",
          "P": 18.4,
          "E": 12.1,
          "Q": 3.2,
          "PE": 6.3,
          "WB_storage": 3.1,
          "GRACE_storage": -5.7
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
