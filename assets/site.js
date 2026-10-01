/* El Paso Seismic Network — the front page.
 *
 * Owns the map, the event list and the detail panel. Waveform drawing
 * lives in waveforms.js (shared with event.html) and must load first.
 *
 * Everything renders from the static JSON under data/ (see DATA.md).
 * No backend. Events are shareable via URL hash: index.html#<event_id>
 */

let catalog = [], markers = {};

// ── Map ────────────────────────────────────────────────────────────
// zoomControl off here and re-added top-right: the default top-left
// position sits underneath the HUD readouts.
const map = L.map('map', { zoomSnap: 0, zoomControl: false })
  .setView([31.82, -106.45], 10);
L.control.zoom({ position: 'topright' }).addTo(map);
L.maplibreGL({
  style: 'https://tiles.openfreemap.org/styles/dark',
  attribution: '&copy; <a href="https://openfreemap.org">OpenFreeMap</a> ' +
    '&copy; <a href="https://www.openstreetmap.org/copyright">OSM</a>, ' +
    'style &copy; <a href="https://carto.com/attributions">CARTO</a>'
}).addTo(map);

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

// ── Event detail panel ─────────────────────────────────────────────
async function showEvent(id) {
  const ev = await loadJSON(`data/events/${id}.json`);
  document.getElementById('detail-hint').style.display = 'none';
  document.getElementById('detail-title').textContent =
    `${typeLabel(ev.event_type)} — M${(ev.magnitude ?? 0).toFixed(1)}`;
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
  const guideRow = document.getElementById('guide-row');
  if (guideRow) guideRow.hidden = false;
  const waveHint = document.getElementById('wave-hint');
  if (waveHint) waveHint.hidden = false;

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

  document.getElementById('st-events').textContent = meta.n_events;
  document.getElementById('st-blasts').textContent = meta.n_quarry_blasts;
  document.getElementById('st-quakes').textContent = meta.n_earthquakes;
  document.getElementById('st-stations').textContent = meta.n_stations;
  document.getElementById('updated').textContent =
    'Catalog updated ' + meta.generated_utc.slice(0, 10) + ' (UTC)';

  for (const s of stations) {
    L.marker([s.latitude, s.longitude], {
      icon: L.divIcon({ className: 'sta-icon', iconSize: [12, 9] }),
      title: `${s.network}.${s.station}`,
    }).addTo(map).bindPopup(`<b>${s.network}.${s.station}</b><br>seismic station`);
  }

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
      color: isEq ? QUAKE : BLAST, weight: 2, opacity: 0.95,
      fillColor: isEq ? QUAKE : BLAST, fillOpacity: 0.55,
    }).addTo(map).bindPopup(
      `<b>${typeLabel(ev.event_type)}</b> M${(ev.magnitude ?? 0).toFixed(1)}` +
      `<br>${describePlace(ev.latitude, ev.longitude) || ''}` +
      `<br>${ev.time.replace('T', ' ').slice(0, 16)} UTC`);
    m.on('click', () => showEvent(ev.event_id));
    markers[ev.event_id] = m;
    }

    const row = document.createElement('div');
    row.className = 'ev-row';
    row.dataset.id = ev.event_id;
    row.setAttribute('role', 'button');
    row.tabIndex = 0;
    row.setAttribute('aria-label',
      `${typeLabel(ev.event_type)}, M${(ev.magnitude ?? 0).toFixed(1)}, ` +
      `${ev.time.slice(0, 10)}`);
    // identity rides the swatch, not the text colour — a categorical hue is
    // not reliably legible as text on the surface
    row.innerHTML =
      `<span class="ev-date">${ev.time.slice(0, 10)}</span>` +
      `<span class="ev-type"><i class="ev-dot ${TYPE_CLASS[ev.event_type] || ''}"></i>` +
      `${typeLabel(ev.event_type)}</span>` +
      `<span class="ev-mag">M${(ev.magnitude ?? 0).toFixed(1)}</span>`;
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
    .concat(stations.map(s => [s.latitude, s.longitude]));
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

  // Anything generated in JS has to be rebuilt when the language flips.
  // Static copy is handled by applyI18n(); this is the rest.
  onLangChange(() => {
    applyI18n();
    renderFreshness(meta, catalog);
    renderExpect(catalog);
    rebuildEventList();
    if (currentEvent) showEvent(currentEvent.event_id);
  });

  revealSections();
  wireScrollSpy();

  // deep link: index.html#<event_id>
  const want = location.hash.slice(1);
  if (want && catalog.some(e => e.event_id === want)) showEvent(want);
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
    `<b>${t('fresh.recent', { date: fmt.format(new Date(newest)), n: days })}</b> ` +
    t('fresh.lag');

  const up = document.getElementById('updated');
  if (up) up.textContent = t('fresh.updated',
    { date: fmt.format(new Date(meta.generated_utc)) });
}

/* Blasting is scheduled work, which makes it the rare kind of seismicity
 * you can tell someone what to expect from. Every figure is computed, so
 * it stays true as the catalog grows. Pattern, never prediction. */
function renderExpect(cat) {
  const blasts = cat.filter(e => e.event_type !== 'earthquake');
  if (!blasts.length) return;

  const fmtHour = new Intl.DateTimeFormat(document.documentElement.lang || 'en',
    { hour: 'numeric', hour12: true });   // "5 PM", not a bare "17"
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
    .format(new Date(Date.UTC(2026, 0, 1, (peakHour + 7) % 24)))
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
