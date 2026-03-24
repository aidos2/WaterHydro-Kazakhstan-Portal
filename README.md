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
| Home | `index.html` | `index_ru.html` | `index_kz.html` | Landing page with feature cards and project overview |
| Spatial Data Catalogue | `spatialData.html` | `spatialData_ru.html` | `spatialData_kz.html` | Searchable table with direct dataset downloads |
| LULC Map | `lulc_map.html` | `lulc_map_ru.html` | `lulc_map_kz.html` | Full-screen ArcGIS Experience Builder map |
| Water Timeseries Dashboard | `timeseries.html` | `timeseries_ru.html` | `timeseries_kz.html` | Interactive choropleth map + time-series charts |

---

## Features

- **Trilingual interface** — full EN / RU / KZ support across all pages
- **Interactive choropleth map** — basin-level visualization of precipitation, ET, and soil moisture with time animation
- **Basin statistics panel** — live MAX / MIN / MEAN with dates, basin count, year range
- **Multi-dataset selection** — switch between GLEAM Water Balance, MSWEP Precipitation, ERA5 Soil Moisture
- **Full-screen LULC map** — ESA WorldCover 100 m rendered via ArcGIS Experience Builder
- **Spatial Data Catalogue** — searchable table with direct downloads in 7 formats
- **NLA-styled UI** — dark navy `#0e1c36`, gold `#c9a84c`, Roboto Condensed — mirrors [nla.nu.edu.kz](https://nla.nu.edu.kz/) branding
- **Custom domain ready** — `CNAME` configured for `waterbalance.org.kz`

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

### Time-Series Data (aggregated per basin)

| Dataset | Variable | Temporal Resolution | Formats |
|---------|----------|--------------------|----|
| MSWEP | Precipitation | Monthly | JSON · CSV · Excel |
| ERA5-Land | Soil Moisture (0–100 cm, 0–289 cm) | Monthly | JSON · CSV · Excel |
| GLEAM | Evapotranspiration · Water Balance | Monthly | JSON · CSV · Excel |

---

## Tech Stack

| Component | Technology |
|-----------|-----------|
| Frontend | HTML5 · CSS3 · JavaScript (ES6+) |
| UI Framework | Bootstrap 5.3 |
| Mapping | OpenLayers 9 · ArcGIS Experience Builder |
| Charts | Chart.js |
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
├── Report Water Use Analysis.html  # Jupyter Notebook export
│
├── style/
│   ├── nla-theme.css            # Shared NLA-style theme
│   └── style.css                # Map/chart layout styles
│
├── js/
│   ├── mapHandler.js            # OpenLayers map, choropleth, selection logic
│   └── chartHandler.js          # Chart.js rendering, CSV/PNG export
│
├── assets/
│   └── ol/                      # OpenLayers library (local)
│
├── image_logo/
│   ├── logo_lulc.svg            # LULC card illustration
│   ├── logo_timeseries.svg      # Timeseries card illustration
│   ├── logo_wateruse.svg        # Water Use card illustration
│   └── Irtysh 1.png             # Background image
│
├── input_data/
│   ├── ALL_watersheds_wgs84.*   # Watershed boundaries
│   ├── Water management basins.*
│   ├── watershed_subbasins.*
│   ├── Hydro Region Boundry.*
│   ├── River network GIRES_v10.*
│   ├── lakes.*
│   ├── ESA_WorldCover_100m.tif
│   ├── P_MSWEP_ALL.*            # Precipitation time series
│   ├── Soil_Moisture_ERA5.*     # Soil moisture time series
│   └── GLEAM_WaterBalanceAllBAsin.*  # Water balance time series
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

> **Note:** A local server is required because the app fetches GeoJSON/JSON files via `fetch()`. Opening `index.html` directly as a `file://` URL will block these requests.

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
