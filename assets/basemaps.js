/* El Paso Seismic Network — base map switcher.
 *
 * Two backdrops: satellite imagery (the default) and street.
 *
 * KEYLESS ONLY. The README forbids API-keyed tile providers — this is a
 * public repo and a public site, so a key here would be a key published.
 * That rules out Mapbox, MapTiler, Google and Bing imagery. Esri's World
 * Imagery service serves without a key and covers both sides of the
 * border, which matters: two of the five quarry clusters are in Juárez,
 * and a US-only source (USGS National Map) would thin out exactly there.
 *
 * Two layer kinds are in play. Street is a maplibre VECTOR style rendered
 * through the GL bridge; satellite is plain RASTER tiles. They swap
 * cleanly, but anything that reads the layer must not assume one.
 *
 * Per-backdrop colours live in site.css, keyed off data-basemap on the
 * .map-frame — including the Leaflet SVG paths, since CSS beats the
 * presentation attributes Leaflet writes inline. The light-grey station
 * triangles and quarry rings would otherwise vanish on a light backdrop.
 */

const OSM_ATTR = '&copy; <a href="https://www.openstreetmap.org/copyright">OSM</a>';

const BASEMAPS = {
  street: {
    kind: 'vector',
    style: 'https://tiles.openfreemap.org/styles/positron',
    attribution: '&copy; <a href="https://openfreemap.org">OpenFreeMap</a> ' +
      OSM_ATTR + ', style &copy; <a href="https://carto.com/attributions">CARTO</a>',
    key: 'basemap.street',
  },
  satellite: {
    kind: 'raster',
    url: 'https://server.arcgisonline.com/ArcGIS/rest/services/' +
         'World_Imagery/MapServer/tile/{z}/{y}/{x}',
    attribution: 'Imagery &copy; <a href="https://www.esri.com">Esri</a>, ' +
      'Maxar, Earthstar Geographics and the GIS User Community',
    maxZoom: 19,
    key: 'basemap.satellite',
  },
};

/* Marker styling per backdrop.
 *
 * WHY THIS IS NOT JUST ONE PAIR OF HEXES. A circle drawn at 55% fill
 * opacity is not its hex — it is that hex COMPOSITED onto whatever is
 * behind it. At the old 0.55 the blast marker measured 2.47:1 on the dark
 * map and 1.85:1 on the light one, both under the 3:1 floor, even though
 * the pure hexes pass. Validate the composite, not the swatch.
 *
 * So: near-opaque fills, a darker emerald step on the light backdrop
 * (#04a14a cannot clear 3:1 against near-white), and a stroke that
 * contrasts with the backdrop rather than matching the fill.
 *
 * Satellite is the case no flat colour solves: against imagery the same
 * green measures 1.65:1 on desert, 3.14:1 on vegetation and 2.10:1 on
 * bright sand. Nothing is reliable, so the marker is defined by its
 * OUTLINE — a white stroke plus the dark drop-shadow in site.css — and
 * the fill only carries identity.
 */
const MARKER_THEME = {
  street:    { blast: '#049143', quake: '#e307dc', stroke: '#14171a', fill: 0.90, weight: 1.5 },
  satellite: { blast: '#04a14a', quake: '#e307dc', stroke: '#ffffff', fill: 0.92, weight: 2 },
};

let activeBasemap = 'satellite';
const basemapListeners = [];
const onBasemapChange = fn => basemapListeners.push(fn);
const currentBasemapName = () => activeBasemap;

/* The one place marker style is decided. Creation and filter-dimming both
 * call it, so they cannot drift apart. */
function markerStyle(isEq, on = true) {
  const th = MARKER_THEME[activeBasemap] || MARKER_THEME.street;
  const hue = isEq ? th.quake : th.blast;
  return on
    ? { color: th.stroke, weight: th.weight, opacity: 0.9,
        fillColor: hue, fillOpacity: th.fill }
    : { color: th.stroke, weight: th.weight, opacity: 0.12,
        fillColor: hue, fillOpacity: 0.06 };
}

const BASEMAP_ORDER = ['street', 'satellite'];
const BASEMAP_STORE = 'eps-basemap';

/* `dark` and `light` were the old names for backdrops that no longer
 * exist. A browser that used the site before still has one of them in
 * storage, so map them onto street rather than silently falling back —
 * same thing here, but explicit about why the branch is there. */
const LEGACY_BASEMAP = { dark: 'street', light: 'street' };

function savedBasemap() {
  try {
    const v = localStorage.getItem(BASEMAP_STORE);
    if (BASEMAPS[v]) return v;
    if (LEGACY_BASEMAP[v]) return LEGACY_BASEMAP[v];
  } catch { /* private mode — fall through to the default */ }
  return 'satellite';
}

function makeBasemapLayer(name) {
  const cfg = BASEMAPS[name] || BASEMAPS.street;
  return cfg.kind === 'raster'
    ? L.tileLayer(cfg.url, { attribution: cfg.attribution, maxZoom: cfg.maxZoom })
    : L.maplibreGL({ style: cfg.style, attribution: cfg.attribution });
}

/* Attaches a switcher to one map. `frame` is the element that carries
 * data-basemap for the CSS; pass the .map-frame so the HUD and legend
 * inside it restyle too. Returns a setter in case a caller needs it. */
function addBasemapControl(map, frame, { position = 'topright' } = {}) {
  activeBasemap = savedBasemap();
  let current = activeBasemap;
  let layer = makeBasemapLayer(current).addTo(map);
  if (frame) frame.dataset.basemap = current;

  const apply = name => {
    if (!BASEMAPS[name] || name === current) return;
    const next = makeBasemapLayer(name).addTo(map);
    // add the replacement first, then drop the old one, so the map is
    // never momentarily transparent mid-swap
    map.removeLayer(layer);
    layer = next;
    current = activeBasemap = name;
    try { localStorage.setItem(BASEMAP_STORE, name); } catch { /* not fatal */ }
    if (frame) frame.dataset.basemap = name;
    paint();
    // markers must be restyled for the new backdrop, not just recoloured
    // by CSS — the dimmed state has to keep working
    for (const fn of basemapListeners) fn(name);
  };

  const ctl = L.control({ position });
  let wrap;
  ctl.onAdd = () => {
    wrap = L.DomUtil.create('div', 'leaflet-control basemap-switch');
    wrap.setAttribute('role', 'group');
    for (const name of BASEMAP_ORDER) {
      const b = L.DomUtil.create('button', '', wrap);
      b.type = 'button';
      b.dataset.basemap = name;
      L.DomEvent.on(b, 'click', L.DomEvent.stop);
      L.DomEvent.on(b, 'click', () => apply(name));
    }
    L.DomEvent.disableClickPropagation(wrap);
    return wrap;
  };
  ctl.addTo(map);

  function paint() {
    if (!wrap) return;
    wrap.setAttribute('aria-label', t('basemap.label'));
    for (const b of wrap.children) {
      const name = b.dataset.basemap;
      b.textContent = t(BASEMAPS[name].key);
      b.classList.toggle('on', name === current);
      // a toggle group: tell assistive tech which one is active
      b.setAttribute('aria-pressed', name === current ? 'true' : 'false');
    }
  }
  paint();
  if (typeof onLangChange === 'function') onLangChange(paint);

  return apply;
}
