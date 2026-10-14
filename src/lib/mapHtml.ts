import { config } from '@/constants/config';
import { colors } from '@/constants/theme';

// A self-contained MapLibre page with OpenFreeMap tiles: free, no API key.
// The app talks to it with messages:
//   app -> map: { type: 'data', playgrounds, user, selectedId, fit }
//              { type: 'center', latitude, longitude, zoom }
//   map -> app: { type: 'ready' } | { type: 'moved', latitude, longitude, radiusKm }
//              { type: 'select', id }
export function mapHtml(center: { latitude: number; longitude: number }) {
  return `<!doctype html>
<html>
<head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no" />
<link href="https://unpkg.com/maplibre-gl@4.7.1/dist/maplibre-gl.css" rel="stylesheet" />
<script src="https://unpkg.com/maplibre-gl@4.7.1/dist/maplibre-gl.js"></script>
<style>
  html, body, #map { margin: 0; padding: 0; height: 100%; width: 100%; }
  .pin { width: 26px; height: 26px; border-radius: 50%; border: 3px solid #fff;
         box-shadow: 0 1px 4px rgba(0,0,0,.35); cursor: pointer; }
  .pin.yes { background: ${colors.gold}; }
  .pin.limited { background: #d9c7a8; }
  .pin.unknown { background: #b5b5b5; width: 18px; height: 18px; }
  .pin.selected { background: ${colors.button}; transform: scale(1.25); z-index: 2; }
  .me { width: 16px; height: 16px; border-radius: 50%; background: #2a7de1;
        border: 3px solid #fff; box-shadow: 0 0 0 6px rgba(42,125,225,.25); }
</style>
</head>
<body>
<div id="map"></div>
<script>
  function send(msg) {
    var s = JSON.stringify(msg);
    if (window.ReactNativeWebView) window.ReactNativeWebView.postMessage(s);
    else if (window.parent) window.parent.postMessage(s, '*');
  }

  var map = new maplibregl.Map({
    container: 'map',
    style: '${config.mapStyleUrl}',
    center: [${center.longitude}, ${center.latitude}],
    zoom: 10,
    attributionControl: { compact: true },
  });
  map.addControl(new maplibregl.NavigationControl({ showCompass: false }), 'top-right');

  var markers = {};
  var me = null;
  var programmaticMove = false;

  function radiusKm() {
    var b = map.getBounds();
    var c = map.getCenter();
    var ne = b.getNorthEast();
    var R = 6371, toRad = Math.PI / 180;
    var dLat = (ne.lat - c.lat) * toRad, dLon = (ne.lng - c.lng) * toRad;
    var h = Math.sin(dLat/2)*Math.sin(dLat/2) + Math.cos(c.lat*toRad)*Math.cos(ne.lat*toRad)*Math.sin(dLon/2)*Math.sin(dLon/2);
    return 2 * R * Math.asin(Math.sqrt(h));
  }

  map.on('moveend', function (e) {
    // Only offer "Search this area" after the person moves the map.
    if (!e.originalEvent || programmaticMove) return;
    var c = map.getCenter();
    send({ type: 'moved', latitude: c.lat, longitude: c.lng, radiusKm: radiusKm() });
  });

  function setData(d) {
    Object.keys(markers).forEach(function (id) { markers[id].remove(); });
    markers = {};
    var bounds = new maplibregl.LngLatBounds();
    (d.playgrounds || []).forEach(function (p) {
      var el = document.createElement('div');
      el.className = 'pin ' + p.access + (p.id === d.selectedId ? ' selected' : '');
      el.setAttribute('aria-label', p.name);
      el.addEventListener('click', function (e) { e.stopPropagation(); send({ type: 'select', id: p.id }); });
      markers[p.id] = new maplibregl.Marker({ element: el }).setLngLat([p.longitude, p.latitude]).addTo(map);
      bounds.extend([p.longitude, p.latitude]);
    });
    if (me) { me.remove(); me = null; }
    if (d.user) {
      var m = document.createElement('div'); m.className = 'me';
      me = new maplibregl.Marker({ element: m }).setLngLat([d.user.longitude, d.user.latitude]).addTo(map);
      bounds.extend([d.user.longitude, d.user.latitude]);
    }
    if (d.fit && !bounds.isEmpty()) {
      markProgrammatic();
      map.fitBounds(bounds, { padding: { top: 80, bottom: 56, left: 48, right: 64 }, maxZoom: 14, duration: 600 });
    }
  }

  function markProgrammatic() {
    programmaticMove = true;
    setTimeout(function () { programmaticMove = false; }, 1200);
  }

  function center(c) {
    markProgrammatic();
    map.flyTo({ center: [c.longitude, c.latitude], zoom: c.zoom || map.getZoom(), duration: 600 });
  }

  function handle(raw) {
    try {
      var msg = typeof raw === 'string' ? JSON.parse(raw) : raw;
      if (msg.type === 'data') setData(msg);
      if (msg.type === 'center') center(msg);
    } catch (e) {}
  }
  window.__handle = handle;
  window.addEventListener('message', function (e) { handle(e.data); });
  document.addEventListener('message', function (e) { handle(e.data); });

  map.on('load', function () { send({ type: 'ready' }); });
  map.on('error', function () { send({ type: 'error' }); });
</script>
</body>
</html>`;
}
