WaterHydro-Kazakhstan-Portal
Open Data GIS Platform for Water Resources of Northern Kazakhstan
Overview
WaterHydro-Kazakhstan-Portal is an open geospatial platform designed to integrate, analyze, and visualize hydrological and remote-sensing data for Northern Kazakhstan.
The portal was developed under the project:
"Water Balance of Northern Kazakhstan’s Water Management Basins Estimated Using Remote Sensing, Global Datasets, and Hydrological Information"
This project was funded by the Ministry of Science and Higher Education of the Republic of Kazakhstan.
Live Portal
https://aidos2.github.io/WaterHydro-Kazakhstan-Portal/ 
Features
•	Interactive web maps (watersheds, basins, sub-basins, hydrological regions)
•	ESA WorldCover 100-m land cover
•	Time-series charts: precipitation (MSWEP), soil moisture (ERA5), water-balance indicators (GLEAM)
•	Datasets available in multiple formats: GeoJSON, Shapefile, GeoPackage, GeoTIFF, CSV, Excel
•	Powered by GeoServer (WMS, WFS, REST API)
•	Built with HTML, CSS, JavaScript, Bootstrap, OpenLayers, Chart.js
Data Overview
Spatial data:
•	Watersheds
•	Basins and sub-basins
•	Hydrological regions
•	Rivers and lakes
•	ESA WorldCover 2020 (100 m)
Time-series data (aggregated per basin):
•	MSWEP monthly precipitation
•	ERA5-Land soil moisture
•	GLEAM evapotranspiration and water-balance metrics
Available formats:
GeoJSON, Shapefile, GeoPackage, GeoTIFF, CSV, Excel, JSON API
Project Structure
WaterHydro-Kazakhstan-Portal/
index.html
spatialData.html
timeseries.html
lulc_map.html
assets/
css/
js/
ol/
image_logo/
data/
README.md
Local Installation
1.	Download or clone the repository:
git clone https://github.com/aidos2/WaterHydro-Kazakhstan-Portal.git 
2.	Open the folder:
cd WaterHydro-Kazakhstan-Portal
3.	Run a local server (optional):
python -m http.server 8000
Visit: http://localhost:8000/
GitHub Pages Deployment
The site is hosted using GitHub Pages from the "main" branch.
To update:
git add .
git commit -m "Update portal"
git push origin main
Citation
WaterHydro-Kazakhstan-Portal (2025). Open Data GIS Platform for Hydrological Analysis of Northern Kazakhstan.
National Laboratory Astana, Ministry of Science and Higher Education of the Republic of Kazakhstan.
https://aidos2.github.io/WaterHydro-Kazakhstan-Portal/ 
Contact
Project Manager: vyapiyev@nu.edu.kz 
Developer / GIS Specialist: aidos_makhanov@icloud.com 
License
MIT License – free to reuse and modify with attribution.

