/* El Paso Seismic Network — the front page.
 *
 * Owns the map, the event list and the detail panel. Waveform drawing
 * lives in waveforms.js (shared with event.html) and must load first.
 *
 * Everything renders from the static JSON under data/ (see DATA.md).
 * No backend. Events are shareable via URL hash: index.html#<event_id>
 */

let catalog = [], markers = {};

/* "M1.4", or "M?" when the catalog has no magnitude for the event (a few
 * 2021 events were located but never sized). Never print a missing value
 * as M0.0. (Same helper in event-page.js; each page loads only one.) */
const fmtMag = m => (m == null ? 'M?' : 'M' + m.toFixed(1));

// ── Map ────────────────────────────────────────────────────────────
// zoomControl off here and re-added top-right: the default top-left
// position sits underneath the HUD readouts.
const map = L.map('map', { zoomSnap: 0, zoomControl: false })
  .setView([31.82, -106.45], 10);
L.control.zoom({ position: 'topright' }).addTo(map);

// dark / light / satellite — see basemaps.js. The frame carries
// data-basemap so the HUD, legend and map annotations restyle with it.
addBasemapControl(map, document.querySelector('.map-frame'));

function magRadius(m) { return Math.max(5, 3.5 * ((m ?? 0.5) + 1.2)); }

/* ── Full-screen map ───────────────────────────────────────────────
 * Fullscreen is requested on .map-frame rather than on #map, so the HUD
 * readouts and the legend — which are absolutely positioned inside the
 * frame — come along instead of being left behind on the page.
 *
 * Leaflet caches the container size, and maplibre sizes its GL canvas from
 * it, so both have to be told the box changed: invalidateSize() after the
 * browser has finished resizing, not before. */

const FS_ICON = {
  enter: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" ' +
    'stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' +
    '<path d="M8 3H5a2 2 0 0 0-2 2v3M16 3h3a2 2 0 0 1 2 2v3M8 21H5a2 2 0 0 1-2-2v-3M16 21h3a2 2 0 0 0 2-2v-3"/></svg>',
  exit: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" ' +
    'stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' +
    '<path d="M8 3v3a2 2 0 0 1-2 2H3M16 3v3a2 2 0 0 0 2 2h3M8 21v-3a2 2 0 0 0-2-2H3M16 21v-3a2 2 0 0 1 2-2h3"/></svg>',
};

const fsSupported = () => !!(document.fullscreenEnabled ||
  document.webkitFullscreenEnabled);

function inFullscreen() {
  return !!(document.fullscreenElement || document.webkitFullscreenElement);
}

function toggleMapFullscreen() {
  const frame = document.querySelector('.map-frame');
  if (!frame) return;
  if (inFullscreen()) {
    (document.exitFullscreen || document.webkitExitFullscreen).call(document);
  } else {
    (frame.requestFullscreen || frame.webkitRequestFullscreen).call(frame);
  }
}

function addFullscreenControl() {
  if (!fsSupported()) return;          // no control rather than a dead button

  const ctl = L.control({ position: 'topright' });
  ctl.onAdd = () => {
    const wrap = L.DomUtil.create('div', 'leaflet-bar leaflet-control map-fs');
    const btn = L.DomUtil.create('button', '', wrap);
    btn.type = 'button';
    btn.id = 'map-fs-btn';
    btn.innerHTML = FS_ICON.enter;
    btn.title = t('map.fullscreen');
    btn.setAttribute('aria-label', t('map.fullscreen'));
    // stop clicks and double-clicks reaching the map underneath
    L.DomEvent.disableClickPropagation(wrap);
    L.DomEvent.on(btn, 'click', L.DomEvent.stop);
    L.DomEvent.on(btn, 'click', toggleMapFullscreen);
    return wrap;
  };
  ctl.addTo(map);

  const onChange = () => {
    const on = inFullscreen();
    const btn = document.getElementById('map-fs-btn');
    if (btn) {
      btn.innerHTML = on ? FS_ICON.exit : FS_ICON.enter;
      const label = on ? t('map.exitFullscreen') : t('map.fullscreen');
      btn.title = label;
      btn.setAttribute('aria-label', label);
    }
    // the container has only just changed size — let layout settle first
    requestAnimationFrame(() => setTimeout(() => map.invalidateSize(), 60));
  };
  document.addEventListener('fullscreenchange', onChange);
  document.addEventListener('webkitfullscreenchange', onChange);
}

/* ── Station filter ────────────────────────────────────────────────
 * A second segmented control under the basemap switch, sharing its
 * styling. Default is `active`: the 49 recovered nodes sit almost on
 * top of one another at city scale and would otherwise bury the 14
 * standing stations under a single grey smear.
 *
 * Layers rather than per-marker show/hide, so switching is one add and
 * one remove however many stations there are. */
const STA_VIEW_ORDER = ['active', 'retired', 'both'];
const STA_VIEW_STORE = 'eps-stations';

function addStationControl(map, layers, { position = 'topright' } = {}) {
  let current = 'active';
  try {
    const v = localStorage.getItem(STA_VIEW_STORE);
    if (STA_VIEW_ORDER.includes(v)) current = v;
  } catch { /* private mode — keep the default */ }

  const apply = name => {
    current = name;
    const want = { active: name !== 'retired', retired: name !== 'active' };
    for (const k of ['active', 'retired']) {
      if (want[k] && !map.hasLayer(layers[k])) layers[k].addTo(map);
      else if (!want[k] && map.hasLayer(layers[k])) map.removeLayer(layers[k]);
    }
    try { localStorage.setItem(STA_VIEW_STORE, name); } catch { /* not fatal */ }
    paint();
  };

  const ctl = L.control({ position });
  let wrap;
  ctl.onAdd = () => {
    wrap = L.DomUtil.create('div', 'leaflet-control basemap-switch station-switch');
    wrap.setAttribute('role', 'group');
    for (const name of STA_VIEW_ORDER) {
      const b = L.DomUtil.create('button', '', wrap);
      b.type = 'button';
      b.dataset.staView = name;
      L.DomEvent.on(b, 'click', L.DomEvent.stop);
      L.DomEvent.on(b, 'click', () => apply(name));
    }
    L.DomEvent.disableClickPropagation(wrap);
    return wrap;
  };
  ctl.addTo(map);

  function paint() {
    if (!wrap) return;
    wrap.setAttribute('aria-label', t('sta.label'));
    for (const b of wrap.children) {
      const name = b.dataset.staView;
      b.textContent = t('sta.' + name);
      b.classList.toggle('on', name === current);
      b.setAttribute('aria-pressed', name === current ? 'true' : 'false');
    }
  }
  apply(current);
  if (typeof onLangChange === 'function') onLangChange(paint);
}

// ── Event detail panel ─────────────────────────────────────────────
async function showEvent(id) {
  const ev = await loadJSON(`data/events/${id}.json`);
  document.getElementById('detail-hint').style.display = 'none';
  document.getElementById('detail-title').textContent =
    `${typeLabel(ev.event_type)}, ${fmtMag(ev.magnitude)}`;
  // lead with the place, not the coordinate — "4 km W of Fort Bliss" is
  // what a local can actually picture
  const where = describePlace(ev.latitude, ev.longitude);
  document.getElementById('detail-meta').innerHTML =
    (where ? `<b class="ev-where">${where}</b><br>` : '') +
    `${ev.time.replace('T', ' ').slice(0, 19)} UTC · ` +
    `${ev.num_picks} ${t('detail.picks')} · ` +
    `${ev.traces.length} ${t('detail.stations')} · ` +
    `<span class="ev-id">${ev.event_id}</span>`;

  currentEvent = ev;
  // a few 2021 events have picks but no archived waveforms: no traces
  // to hover, so no guide toggle or hover hint either
  const hasWaves = ev.traces.length > 0;
  const guideRow = document.getElementById('guide-row');
  if (guideRow) guideRow.hidden = !hasWaves;
  const waveHint = document.getElementById('wave-hint');
  if (waveHint) waveHint.hidden = !hasWaves;

  // the panel is the quick look; the deep page is one click away
  const more = document.getElementById('detail-link');
  const moreWrap = document.getElementById('detail-more');
  if (more) more.href = `event.html#${id}`;
  if (moreWrap) moreWrap.hidden = false;

  if (typeof hideWaveExplainer === 'function') hideWaveExplainer();
  renderWaves();

  document.querySelectorAll('.ev-row').forEach(r => {
    const on = r.dataset.id === id;
    r.classList.toggle('active', on);
    r.setAttribute('aria-current', on ? 'true' : 'false');
  });
  if (markers[id]) markers[id].openPopup();
  history.replaceState(null, '', '#' + id);
}

// ── Boot ───────────────────────────────────────────────────────────
// filters.js and clusters.js wait on this: they need `catalog` populated
// and every marker built before they can filter or dim anything.
window.siteReady = (async function init() {
  const [meta, cat, stations] = await Promise.all([
    loadJSON('data/meta.json'), loadJSON('data/catalog.json'),
    loadJSON('data/stations.json'),
  ]);
  catalog = cat;

  /* ── Stations: the standing network vs recovered deployments ─────
     data/stations.json carries no status field and never will — it is
     overwritten wholesale by every pipeline export — so status is
     derived here from the NETWORK CODE, which is stable and meaningful:

       AM  Raspberry Shake community sensors   standing
       EP  KIDD, the UTEP broadband station    standing
       4B  Fairfield ZLand nodal deployment    recovered (June 2021)

     The 49 nodes ran for four days in 2021 and are long since pulled
     out of the ground; they still matter because 2021 events were
     located with them. RETIRED_STATIONS is the escape hatch for a
     single box that bucks its network — add the code and nothing else
     has to change. */
  const RETIRED_NETWORKS = new Set(['4B']);
  const RETIRED_STATIONS = new Set([]);
  const isRetired = s =>
    RETIRED_STATIONS.has(s.station) || RETIRED_NETWORKS.has(s.network);

  document.getElementById('st-events').textContent = meta.n_events;
  document.getElementById('st-blasts').textContent = meta.n_quarry_blasts;
  document.getElementById('st-quakes').textContent = meta.n_earthquakes;
  document.getElementById('st-stations').textContent =
    stations.filter(s => !isRetired(s)).length;

  const staLayers = { active: L.layerGroup(), retired: L.layerGroup() };
  for (const s of stations) {
    const retired = isRetired(s);
    L.marker([s.latitude, s.longitude], {
      icon: L.divIcon({
        className: retired ? 'sta-icon sta-retired' : 'sta-icon',
        iconSize: [12, 9],
      }),
      title: `${s.network}.${s.station}`,
    }).bindPopup(() =>   // a function, so the popup follows the language
      `<b>${s.network}.${s.station}</b><br>${s.model}<br>` +
      t(retired ? 'sta.retiredNote' : 'sta.activeNote')
    ).addTo(staLayers[retired ? 'retired' : 'active']);
  }
  addStationControl(map, staLayers);

  buildEventList();
  rebuildEventList = buildEventList;

  function buildEventList() {
  const list = document.getElementById('event-list');
  list.innerHTML = '';
  for (const ev of catalog) {
    const isEq = ev.event_type === 'earthquake';
    if (!markers[ev.event_id]) {
    const m = L.circleMarker([ev.latitude, ev.longitude], {
      radius: magRadius(ev.magnitude),
      ...markerStyle(isEq),            // see MARKER_THEME in basemaps.js
    }).addTo(map).bindPopup(() =>     // built on open: follows the language
      `<b>${typeLabel(ev.event_type)}</b> ${fmtMag(ev.magnitude)}` +
      `<br>${describePlace(ev.latitude, ev.longitude) || ''}` +
      `<br>${ev.time.replace('T', ' ').slice(0, 16)} UTC`);
    m.on('click', () => showEvent(ev.event_id));
    m._isEq = isEq;                    // filters.js restyles by type
    markers[ev.event_id] = m;
    }

    const row = document.createElement('div');
    row.className = 'ev-row';
    row.dataset.id = ev.event_id;
    row.setAttribute('role', 'button');
    row.tabIndex = 0;
    row.setAttribute('aria-label',
      `${typeLabel(ev.event_type)}, ${fmtMag(ev.magnitude)}, ` +
      `${ev.time.slice(0, 10)}`);
    // identity rides the swatch, not the text colour — a categorical hue is
    // not reliably legible as text on the surface
    row.innerHTML =
      `<span class="ev-date">${ev.time.slice(0, 10)}</span>` +
      `<span class="ev-type"><i class="ev-dot ${TYPE_CLASS[ev.event_type] || ''}"></i>` +
      `${typeLabel(ev.event_type)}</span>` +
      `<span class="ev-mag">${fmtMag(ev.magnitude)}</span>`;
    row.addEventListener('click', () => showEvent(ev.event_id));
    row.addEventListener('keydown', e => {
      if (e.key !== 'Enter' && e.key !== ' ') return;
      e.preventDefault();
      showEvent(ev.event_id);
    });
    list.appendChild(row);
  }
  }

  // Frame the map on the data rather than a hard-coded centre, so the
  // catalog growing north or south doesn't leave events off-screen.
  const pts = catalog.map(e => [e.latitude, e.longitude])
    .concat(stations.filter(s => !isRetired(s))
                    .map(s => [s.latitude, s.longitude]));
  if (pts.length) map.fitBounds(L.latLngBounds(pts).pad(0.12));

  addFullscreenControl();

  const toggle = document.getElementById('guide-toggle');
  if (toggle) {
    toggle.addEventListener('change', () => {
      showGuides = toggle.checked;
      renderWaves();
    });
  }

  // canvases are sized from clientWidth, so they need a redraw on resize
  let rt;
  window.addEventListener('resize', () => {
    clearTimeout(rt); rt = setTimeout(renderWaves, 150);
  });

  renderFreshness(meta, catalog);
  renderExpect(catalog);
  // "refreshed 5 minutes ago" keeps counting while the tab stays open
  setInterval(() => renderFreshness(meta, catalog), 30000);

  // Anything generated in JS has to be rebuilt when the language flips.
  // Static copy is handled by applyI18n(); this is the rest.
  onLangChange(() => {
    applyI18n();
    renderFreshness(meta, catalog);
    renderExpect(catalog);
    rebuildEventList();
    // the rebuilt rows are all visible again; re-apply the active filters
    // (and their chip text, now in the new language)
    if (typeof applyFilters === 'function') applyFilters();
    if (currentEvent) showEvent(currentEvent.event_id);
  });

  revealSections();
  wireScrollSpy();

  // deep link: index.html#<event_id>, including the pre-2026-10-16
  // positional ids (data/aliases.json), and a hash changed in place
  const openFromHash = async () => {
    let want = decodeURIComponent(location.hash.slice(1));
    if (!want || currentEvent?.event_id === want) return;
    if (!catalog.some(e => e.event_id === want)) {
      const aliases = await loadJSON('data/aliases.json').catch(() => ({}));
      want = aliases[want];
    }
    if (want && catalog.some(e => e.event_id === want)) showEvent(want);
  };
  openFromHash();
  window.addEventListener('hashchange', openFromHash);
})();

let rebuildEventList = () => {};

/* How fresh is this actually? A visitor who felt something last night and
 * finds nothing recent will assume the project is dead unless the page
 * says otherwise. Manual review means recent days are normally empty. */
function renderFreshness(meta, cat) {
  const host = document.getElementById('freshness');
  if (!host || !cat.length) return;
  const newest = cat.reduce((a, e) => (e.time > a ? e.time : a), cat[0].time);
  const days = Math.floor((Date.now() - new Date(newest)) / 86400000);
  const fmt = new Intl.DateTimeFormat(document.documentElement.lang || 'en',
    { dateStyle: 'long' });

  host.innerHTML =
    `<b>${t('fresh.refreshed', { ago: timeAgo(meta.generated_utc) })}</b> ` +
    t('fresh.recent', { date: fmt.format(new Date(newest)), n: days }) + ' ' +
    t('fresh.lag');
  host.title = new Date(meta.generated_utc).toLocaleString(
    document.documentElement.lang || 'en', { dateStyle: 'long', timeStyle: 'short' });

  const up = document.getElementById('updated');
  if (up) up.textContent = t('fresh.updated',
    { date: fmt.format(new Date(meta.generated_utc)) });
}

/* "3 hours ago", "yesterday", in the page language. Coarse on purpose:
 * minutes for the first hour, then hours, then days. */
function timeAgo(iso) {
  const rtf = new Intl.RelativeTimeFormat(document.documentElement.lang || 'en',
    { numeric: 'auto' });
  const mins = Math.max(0, Math.round((Date.now() - new Date(iso)) / 60000));
  if (mins < 60) return rtf.format(-mins, 'minute');
  if (mins < 24 * 60) return rtf.format(-Math.floor(mins / 60), 'hour');
  return rtf.format(-Math.floor(mins / 1440), 'day');
}

/* Blasting is scheduled work, which makes it the rare kind of seismicity
 * you can tell someone what to expect from. Every figure is computed, so
 * it stays true as the catalog grows. Pattern, never prediction. */
function renderExpect(cat) {
  const blasts = cat.filter(e => e.event_type !== 'earthquake');
  if (!blasts.length) return;

  // peakHour is already El Paso time; format it as a wall-clock hour in UTC
  // so the visitor's own timezone can't shift it
  const fmtHour = new Intl.DateTimeFormat(document.documentElement.lang || 'en',
    { hour: 'numeric', hour12: true, timeZone: 'UTC' });   // "5 PM", not "17"
  const localHour = iso => Number(new Intl.DateTimeFormat('en-US',
    { timeZone: 'America/Denver', hour: '2-digit', hour12: false })
    .format(new Date(iso))) % 24;

  const byHour = new Map();
  for (const b of blasts) {
    const h = localHour(b.time);
    byHour.set(h, (byHour.get(h) || 0) + 1);
  }
  let peakHour = 0, peakN = 0;
  for (const [h, n] of byHour) if (n > peakN) { peakN = n; peakHour = h; }

  const times = blasts.map(b => new Date(b.time)).sort((a, b) => a - b);
  const gaps = times.slice(1).map((d, i) => Math.round((d - times[i]) / 86400000));
  const sorted = [...gaps].sort((a, b) => a - b);
  const median = sorted.length ? sorted[Math.floor(sorted.length / 2)] : 0;

  const sundays = blasts.filter(b => new Intl.DateTimeFormat('en-US',
    { timeZone: 'America/Denver', weekday: 'short' })
    .format(new Date(b.time)) === 'Sun').length;

  // es-MX renders "5 p. m." with a trailing period; the sentence supplies
  // its own, so trim it rather than printing "5 p. m.."
  const hourLabel = fmtHour
    .format(new Date(Date.UTC(2026, 0, 1, peakHour)))
    .replace(/\.$/, '');
  const set = (id, html) => {
    const el = document.getElementById(id);
    if (el) el.innerHTML = html;
  };
  set('expect-when', t('expect.when', { hour: hourLabel }));
  set('expect-gap', t('expect.gap',
    { gap: median, max: gaps.length ? Math.max(...gaps) : 0 }));
  set('expect-sunday', t('expect.sunday', { sun: sundays, total: blasts.length }));
}

/* Highlights the nav link for whichever section you are currently in.
 * Pure decoration, so it degrades to nothing without IntersectionObserver. */
function wireScrollSpy() {
  const links = [...document.querySelectorAll('.topnav a[href^="#"]')];
  if (!links.length || !('IntersectionObserver' in window)) return;

  const byId = new Map(links.map(a => [a.getAttribute('href').slice(1), a]));
  const targets = [...byId.keys()]
    .map(id => document.getElementById(id)).filter(Boolean);

  const seen = new Set();
  const io = new IntersectionObserver(entries => {
    for (const e of entries) {
      if (e.isIntersecting) seen.add(e.target.id); else seen.delete(e.target.id);
    }
    // topmost visible section wins, so scrolling up re-selects correctly
    const active = targets.find(t => seen.has(t.id));
    links.forEach(a =>
      a.classList.toggle('current', !!active && a.getAttribute('href') === '#' + active.id));
  }, { rootMargin: '-20% 0px -70% 0px' });

  targets.forEach(t => io.observe(t));
}

/* Sections fade up as they arrive. Applied from JS and only when the
 * viewer hasn't asked for reduced motion, so the content is never hidden
 * behind an animation that might not run — no JS, no IntersectionObserver,
 * or reduced motion all leave the page fully visible. */
function revealSections() {
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (reduced || !('IntersectionObserver' in window)) return;

  // The first screen must be solid the instant it paints — never fade in
  // the map or the finding itself.
  const targets = document.querySelectorAll(
    'main > section:not(.map-hero):not(.story)');
  const io = new IntersectionObserver((entries, obs) => {
    for (const e of entries) {
      if (!e.isIntersecting) continue;
      e.target.classList.add('in');
      obs.unobserve(e.target);
    }
  }, { rootMargin: '0px 0px -8% 0px' });

  targets.forEach(el => { el.classList.add('reveal'); io.observe(el); });
}
