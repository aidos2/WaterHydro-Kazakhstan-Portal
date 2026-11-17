/* ================================================================
 *  mapExtent.js – keeps every OpenLayers map inside the Hydro Region
 *  Boundary (input_data/Hydro Region Boundry.geojson).
 *
 *  Zooming in works as usual; zooming out stops once the whole
 *  hydro-region extent is visible, and panning cannot leave it.
 *  Used by mapHandler.js, storyMap.js and waterUseHandler.js.
 * ================================================================ */

/* Bounding box of the North + South hydro regions (lon/lat, WGS84) */
const HYDRO_EXTENT_LONLAT = [45.386970, 34.483333, 91.925529, 58.321401];
const HYDRO_EXTENT = ol.proj.transformExtent(HYDRO_EXTENT_LONLAT, 'EPSG:4326', 'EPSG:3857');

/** ol.View locked to the hydro-region extent; extra options pass through */
function hydroView (opts = {}) {
  return new ol.View({
    center: ol.extent.getCenter(HYDRO_EXTENT),
    zoom: 4,
    ...opts,
    extent: HYDRO_EXTENT,
    showFullExtent: true,            // furthest zoom-out = the whole extent
    smoothExtentConstraint: false,   // hard stop at the edges, no elastic overshoot
    smoothResolutionConstraint: false
  });
}

/** Re-apply the limits after the map element changes size (or on first layout) */
function hydroLock (map) {
  const resolve = () => map.getView().resolveConstraints(0);
  map.on('change:size', resolve);
  map.once('rendercomplete', resolve);
  return map;
}
