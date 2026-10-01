/* El Paso Seismic Network — shared filter state.
 *
 * One catalog, one filter object, three independent dimensions:
 *
 *   FILTER.bin   { chart, key }  a bar picked in a histogram (charts.js)
 *   FILTER.site  cluster id      a quarry site picked on the map (clusters.js)
 *   FILTER.q     string          free-text search (wired below)
 *
 * They intersect. Picking 17:00 and then Site B answers "does this quarry
 * blast at the same hour as the others?" — which is the whole point of
 * letting them compose instead of replacing each other.
 *
 * Loaded after site.js (needs `markers` + `catalog`) and before charts.js
 * and clusters.js, which register redraw callbacks via onFilterChange().
 */

const TZ = 'America/Denver';

const LOCAL_FMT = new Intl.DateTimeFormat('en-US', {
  timeZone: TZ, hour12: false,
  weekday: 'short', year: 'numeric', month: 'short', day: '2-digit',
  hour: '2-digit', minute: '2-digit',
});

function localParts(iso) {
  const parts = {};
  for (const p of LOCAL_FMT.formatToParts(new Date(iso))) {
    if (p.type !== 'literal') parts[p.type] = p.value;
  }
  return {
    hour: Number(parts.hour) % 24,      // some engines emit "24" for midnight
    minute: parts.minute,
    weekday: parts.weekday,
    month: parts.month,
    year: Number(parts.year),
    ym: `${parts.year}-${parts.month}`,
  };
}

let EVENTS = [];                                  // catalog + cached .local
const FILTER = { bin: null, site: null, q: '' };
const filterListeners = [];
const onFilterChange = fn => filterListeners.push(fn);

/* Event counts read differently per language, so they go through the
 * string table rather than an English "+s" rule. */
const plural = n => n === 1 ? t('catalog.oneEvent') : t('catalog.nEvents', { n });

// ── Predicates, one per dimension ──────────────────────────────────
function passesBin(ev) {
  const f = FILTER.bin;
  if (!f) return true;
  if (f.chart === 'hour') return String(ev.local.hour) === f.key;
  if (f.chart === 'dow') return ev.local.weekday === f.key;
  if (f.chart === 'month') return ev.local.ym === f.key;
  if (f.chart === 'mag') {
    if (ev.magnitude == null) return false;
    const lo = Number(f.key);
    return ev.magnitude >= lo && ev.magnitude < lo + 0.25;
  }
  return true;
}

const passesSite = ev => !FILTER.site || ev.site_id === FILTER.site;

// Search matches id, type, date, magnitude and site label — whatever a
// student is most likely to paste in.
function passesQuery(ev) {
  const q = FILTER.q.trim().toLowerCase();
  if (!q) return true;
  return q.split(/\s+/).every(term => (
    ev.event_id.toLowerCase().includes(term) ||
    ev.event_type.replace('_', ' ').includes(term) ||
    ev.time.slice(0, 10).includes(term) ||
    (ev.site_label || '').toLowerCase().includes(term) ||
    (ev.magnitude != null && ('m' + ev.magnitude.toFixed(2)).includes(term))
  ));
}

// Bars are computed from everything EXCEPT the bar selection, so picking a
// bar dims its neighbours instead of erasing them.
const chartSubset = () => EVENTS.filter(ev => passesSite(ev) && passesQuery(ev));
const visibleEvents = () => chartSubset().filter(passesBin);

// ── Apply ──────────────────────────────────────────────────────────
function anyActive() {
  return !!(FILTER.bin || FILTER.site || FILTER.q.trim());
}

function applyFilters() {
  const keep = new Set(visibleEvents().map(ev => ev.event_id));
  // Keyed off the filters themselves, not the count: a search that happens
  // to match every event should still read as an active filter.
  const narrowed = anyActive();

  document.querySelectorAll('.ev-row').forEach(row => {
    row.hidden = narrowed && !keep.has(row.dataset.id);
  });

  const empty = document.getElementById('empty-note');
  if (empty) empty.hidden = !(narrowed && keep.size === 0);

  if (typeof markers !== 'undefined') {
    for (const [id, m] of Object.entries(markers)) {
      if (!m.setStyle) continue;
      const on = !narrowed || keep.has(id);
      m.setStyle({ opacity: on ? 0.95 : 0.1, fillOpacity: on ? 0.55 : 0.04 });
    }
  }

  renderChips(keep.size);
  announce(keep.size, narrowed);
  for (const fn of filterListeners) fn();
}

function setFilter(kind, value) {
  FILTER[kind] = value;
  applyFilters();
}

function clearFilters() {
  FILTER.bin = null; FILTER.site = null; FILTER.q = '';
  const box = document.getElementById('search');
  if (box) box.value = '';
  applyFilters();
}

// ── Active-filter chips ────────────────────────────────────────────
function chipLabel(kind) {
  if (kind === 'bin') {
    const f = FILTER.bin;
    const tip = document.querySelector(
      `.bar[data-chart="${f.chart}"][data-key="${CSS.escape(f.key)}"]`)?.dataset.tip;
    return tip ? tip.replace(/ · .*/, '') : f.key;
  }
  if (kind === 'site') {
    return EVENTS.find(e => e.site_id === FILTER.site)?.site_label || 'Site';
  }
  return `“${FILTER.q.trim()}”`;
}

function renderChips(n) {
  const host = document.getElementById('filter-chip');
  if (!host) return;
  const active = ['site', 'bin', 'q'].filter(k => k === 'q' ? FILTER.q.trim() : FILTER[k]);
  if (!active.length) { host.hidden = true; host.innerHTML = ''; return; }

  host.innerHTML =
    active.map(k => `<button type="button" class="chip" data-clear="${k}" ` +
      `aria-label="${chipLabel(k)}">${chipLabel(k)}<span aria-hidden="true">×</span></button>`).join('') +
    `<span class="chip-count">${plural(n)}</span>` +
    (active.length > 1 ? `<button type="button" class="chip chip-all">${t('catalog.clearAll')}</button>` : '');

  host.hidden = false;
  host.querySelectorAll('[data-clear]').forEach(b => b.addEventListener('click', () => {
    const k = b.dataset.clear;
    setFilter(k, k === 'q' ? '' : null);
    if (k === 'q') { const s = document.getElementById('search'); if (s) s.value = ''; }
  }));
  host.querySelector('.chip-all')?.addEventListener('click', clearFilters);
}

function announce(n, narrowed) {
  const live = document.getElementById('live-status');
  if (live) live.textContent = narrowed
    ? t('catalog.matching', { n })
    : t('catalog.showing', { n: EVENTS.length });
}

// ── Boot ───────────────────────────────────────────────────────────
const filtersReady = (async function initFilters() {
  await (window.siteReady || Promise.resolve());
  EVENTS = catalog.map(ev => ({ ...ev, local: localParts(ev.time) }));

  const box = document.getElementById('search');
  if (box) {
    let t;
    box.addEventListener('input', () => {
      clearTimeout(t);
      t = setTimeout(() => setFilter('q', box.value), 120);
    });
    box.addEventListener('keydown', e => {
      if (e.key === 'Escape') { box.value = ''; setFilter('q', ''); }
    });
  }
  return EVENTS;
})();
