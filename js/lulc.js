// Define a view
var view = new ol.View({
    center: ol.proj.fromLonLat([69, 48]), // Center Kazakhstan
    zoom: 5
});

// Define basemap
var OSMBaseMap = new ol.layer.Tile({
    source: new ol.source.OSM({ wrapX: false }),
    title: 'BaseMap'
});

// Define array of layers
var layerArray = [OSMBaseMap];

// Define our map
var map = new ol.Map({
    target: 'map',
    layers: layerArray,
    view: view
});

// Define a WMS source
var tileWMSSource = new ol.source.TileWMS({
    url: 'http://localhost:8080/geoserver/KZ_Water_Portal/wms',
    params: {
        'LAYERS': 'KZ_Water_Portal:LULC_resample',
        'TILED': true,
        'TRANSPARENT': true
    },
    serverType: 'geoserver',
    projection: 'EPSG:3857'
});

// Define a WMS Layer
var tileWMSLayer = new ol.layer.Tile({
    source: tileWMSSource,
    title: 'LULC Raster'
});
map.addLayer(tileWMSLayer);

// Function to add GeoJSON vector layers with style
function addVectorLayer(path, options) {
    return new ol.layer.Vector({
        source: new ol.source.Vector({
            url: path,
            format: new ol.format.GeoJSON()
        }),
        title: options.title,
        style: new ol.style.Style({
            stroke: new ol.style.Stroke({
                color: options.stroke || 'black',
                width: options.width || 2
            }),
            fill: new ol.style.Fill({
                color: options.fill || 'rgba(0,0,0,0)'
            })
        })
    });
}

// Add vector layers with styles
var hydroRegion = addVectorLayer('input_data/Hydro Region Boundry.geojson',
    { title: 'Hydro Region', stroke: 'red', width: 2 });
var allWatersheds = addVectorLayer('input_data/ALL_watersheds_wgs84.geojson',
    { title: 'All Watersheds', stroke: 'green', width: 2 ,fill: 'rgba(255,0,0,0.1)'});
var waterBasins = addVectorLayer('input_data/Water management basins.geojson',
    { title: 'Water Basins', stroke: 'red', width: 2, fill: 'rgba(255,0,0,0.1)' });
var lakes = addVectorLayer('input_data/lakes.geojson',
    { title: 'Lakes', stroke: 'blue', width: 1, fill: 'rgba(0,0,255,0.3)' });
var rivers = addVectorLayer('input_data/rivers.geojson',
    { title: 'Rivers', stroke: 'navy', width: 1 });

// Add to map
map.addLayer(hydroRegion);
map.addLayer(allWatersheds);
map.addLayer(waterBasins);
map.addLayer(lakes);
map.addLayer(rivers);

// ---------------- Layer Switcher ----------------
var layerSwitcher = document.createElement('div');
layerSwitcher.id = 'layer-switcher';
layerSwitcher.innerHTML = '<strong>Layers</strong><br/>';

// Build checkboxes for each layer
map.getLayers().forEach(function (layer) {
    if (layer.get('title')) {
        var label = document.createElement('label');
        var input = document.createElement('input');
        input.type = 'checkbox';
        input.checked = true;
        input.onchange = function () {
            layer.setVisible(this.checked);
        };
        label.appendChild(input);
        label.appendChild(document.createTextNode(' ' + layer.get('title')));
        layerSwitcher.appendChild(label);
        layerSwitcher.appendChild(document.createElement('br'));
    }
});

document.body.appendChild(layerSwitcher);
