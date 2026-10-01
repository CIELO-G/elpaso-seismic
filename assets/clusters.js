/* El Paso Seismic Network — per-quarry event clusters.
 *
 * Blasts repeat at fixed places: a working quarry fires from the same pit
 * for years, so its events pile into a tight knot a few hundred metres
 * across, while the location scatter smears them over ~1-2 km. Single-link
 * clustering at LINK_KM recovers one group per active pit.
 *
 * Only quarry blasts are clustered. Earthquakes are one-offs by nature and
 * grouping them by location would imply a source that isn't there.
 *
 * NOTE ON NAMING: these clusters are derived from the catalog alone. We
 * label them Site A, B, C… by size and describe where they sit. We do not
 * name the operating quarry — nothing in `data/` identifies an operator,
 * and guessing one would put a claim on the page the data can't support.
 */

const LINK_KM = 3.0;                       // single-link threshold
const DOWNTOWN = { lat: 31.7587, lon: -106.4869 };
/* One NEUTRAL colour for every pit. All the rings are on screen at once,
 * so any two can sit side by side — the all-pairs case, where a five-hue
 * categorical set cannot clear the separation gates. The letter on the
 * ring carries identity, and selecting a site dims the others: emphasis,
 * not a rainbow. Neutral rather than coloured on purpose: a ring is an
 * annotation, and must never be mistaken for an event. */
const SITE_RING = '#c9d1d9';
const COMPASS = ['N', 'NNE', 'NE', 'ENE', 'E', 'ESE', 'SE', 'SSE',
  'S', 'SSW', 'SW', 'WSW', 'W', 'WNW', 'NW', 'NNW'];

let sites = [], siteLayer = null;

function kmBetween(a, b) {
  const dy = (a.latitude - b.latitude) * 111.0;
  const dx = (a.longitude - b.longitude) * 111.0 *
    Math.cos((a.latitude + b.latitude) / 2 * Math.PI / 180);
  return Math.hypot(dx, dy);
}

function bearingFrom(lat, lon) {
  const dy = (lat - DOWNTOWN.lat) * 111.0;
  const dx = (lon - DOWNTOWN.lon) * 111.0 * Math.cos(lat * Math.PI / 180);
  const deg = (Math.atan2(dx, dy) * 180 / Math.PI + 360) % 360;
  return { dir: COMPASS[Math.round(deg / 22.5) % 16], km: Math.hypot(dx, dy) };
}

// Single-link agglomeration: an event joins a group if it is within
// LINK_KM of ANY member, then groups that now touch are merged.
function cluster(evs) {
  const groups = [];
  for (const ev of evs) {
    const hits = groups.filter(g => g.some(m => kmBetween(ev, m) < LINK_KM));
    if (!hits.length) { groups.push([ev]); continue; }
    const merged = hits.flat().concat([ev]);
    for (const g of hits) groups.splice(groups.indexOf(g), 1);
    groups.push(merged);
  }
  return groups.sort((a, b) => b.length - a.length);
}

function summarise(group, i) {
  const lat = group.reduce((s, e) => s + e.latitude, 0) / group.length;
  const lon = group.reduce((s, e) => s + e.longitude, 0) / group.length;
  const centre = { latitude: lat, longitude: lon };
  const spread = Math.max(0.25, ...group.map(e => kmBetween(e, centre)));

  const byHour = new Map();
  for (const e of group) byHour.set(e.local.hour, (byHour.get(e.local.hour) || 0) + 1);
  let peakHour = null, peakN = 0;
  for (const [h, n] of byHour) if (n > peakN) { peakN = n; peakHour = h; }

  const mags = group.map(e => e.magnitude).filter(m => m != null);
  const { dir, km } = bearingFrom(lat, lon);

  return {
    id: 'site-' + i,
    letter: String.fromCharCode(65 + i),
    label: t('sites.site', { letter: String.fromCharCode(65 + i) }),
    // a landmark a local recognises, not a bearing from an arbitrary origin
    where: describePlace(lat, lon) ||
           t('place.of', { km: km.toFixed(0), dir, place: 'El Paso' }),
    lat, lon, spread, n: group.length,
    peakHour, peakN,
    magLo: mags.length ? Math.min(...mags) : null,
    magHi: mags.length ? Math.max(...mags) : null,
    first: group.reduce((a, e) => e.time < a ? e.time : a, group[0].time).slice(0, 10),
    last: group.reduce((a, e) => e.time > a ? e.time : a, group[0].time).slice(0, 10),
  };
}

const hour12 = h => `${h % 12 === 0 ? 12 : h % 12}${h < 12 ? ' a.m.' : ' p.m.'}`;

// ── Map overlay ────────────────────────────────────────────────────
function drawSiteCircles() {
  if (typeof map === 'undefined') return;
  siteLayer = L.layerGroup().addTo(map);
  for (const s of sites) {
    const c = L.circle([s.lat, s.lon], {
      radius: Math.max(s.spread, 0.8) * 1000,
      color: SITE_RING, weight: 1.5, opacity: 0.85, dashArray: '5 4',
      fillColor: SITE_RING, fillOpacity: 0.05, className: 'site-ring',
    }).addTo(siteLayer);
    // A standing letter, not a hover tooltip: it is what visually ties a
    // ring on the map to its card below. Only 5-6 of them, so it stays calm.
    c.bindTooltip(s.letter, {
      permanent: true, direction: 'center', className: 'site-tag',
      opacity: 1,
    });
    c.on('click', () => toggleSite(s.id));
    s._circle = c;
  }
}

function toggleSite(id) {
  setFilter('site', FILTER.site === id ? null : id);
  document.querySelector('.content')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

// ── Site cards ─────────────────────────────────────────────────────
function renderSites() {
  const host = document.getElementById('site-list');
  if (!host) return;
  host.innerHTML = sites.map(s => {
    const on = FILTER.site === s.id;
    return `<button type="button" class="site-card${on ? ' active' : ''}" data-site="${s.id}"
      aria-pressed="${on}">
      <span class="site-badge" aria-hidden="true">${s.letter}</span>
      <span class="site-body">
        <span class="site-name">${s.label}</span>
        <span class="site-where">${s.where}</span>
        <span class="site-stats">
          <b>${s.n}</b> ${s.n === 1 ? t('sites.blast') : t('sites.blasts')}
          ${s.peakN > 1 ? ` · ${t('sites.usually', { hour: hour12(s.peakHour) })}` : ''}
          ${s.magLo != null ? ` · M${s.magLo.toFixed(1)}–${s.magHi.toFixed(1)}` : ''}
        </span>
      </span>
    </button>`;
  }).join('');

  host.querySelectorAll('[data-site]').forEach(b =>
    b.addEventListener('click', () => toggleSite(b.dataset.site)));
}

function refreshSiteStyles() {
  for (const s of sites) {
    if (!s._circle) continue;
    const picked = FILTER.site === s.id;
    const on = !FILTER.site || picked;
    s._circle.setStyle({
      opacity: on ? (picked ? 1 : 0.85) : 0.15,
      weight: picked ? 2.5 : 1.5,
      fillOpacity: on ? (picked ? 0.12 : 0.05) : 0.015,
    });
    const tag = s._circle.getTooltip()?.getElement();
    if (tag) tag.style.opacity = on ? 1 : 0.18;
  }
  renderSites();
}

// ── Boot ───────────────────────────────────────────────────────────
(async function initClusters() {
  await filtersReady;

  const blasts = EVENTS.filter(e => e.event_type !== 'earthquake');
  const groups = cluster(blasts).filter(g => g.length > 1);
  sites = groups.map(summarise);

  // stamp membership onto the shared catalog so filters.js can match
  groups.forEach((g, i) => g.forEach(ev => {
    ev.site_id = sites[i].id;
    ev.site_label = sites[i].label;
  }));

  const lead = document.getElementById('sites-lead');
  if (lead && sites.length) {
    const top = sites[0];
    const inSites = groups.flat().length;
    lead.textContent = t('sites.lead', {
      inSites, total: blasts.length, n: sites.length,
      top: top.label, topN: top.n, spread: top.spread.toFixed(1),
    });
  }

  drawSiteCircles();
  refreshSiteStyles();          // also paints each map tag its site colour
  onFilterChange(refreshSiteStyles);
  onLangChange(() => {
    sites.forEach((s, i) => {
      s.label = t('sites.site', { letter: s.letter });
      s.where = describePlace(s.lat, s.lon) || s.where;
    });
    EVENTS.forEach(ev => {
      const hit = sites.find(s => s.id === ev.site_id);
      if (hit) ev.site_label = hit.label;
    });
    renderSites();
    const l = document.getElementById('sites-lead');
    if (l && sites.length) l.textContent = t('sites.lead', {
      inSites: groups.flat().length, total: blasts.length, n: sites.length,
      top: sites[0].label, topN: sites[0].n, spread: sites[0].spread.toFixed(1),
    });
  });
})();
