/* El Paso Seismic Network — public site.
 *
 * Everything renders from the static JSON under data/ (see DATA.md for
 * the schema). No backend: this page can be served by any static host.
 * Events are shareable via URL hash: index.html#<event_id>
 */

const TYPE_LABEL = { quarry_blast: 'Quarry blast', earthquake: 'Earthquake' };
const TYPE_CLASS = { quarry_blast: 'blast', earthquake: 'eq' };
const ACCENT = '#f57c00', BLUE = '#5b9dd9';

let catalog = [], markers = {};

async function loadJSON(path) {
  const r = await fetch(path);
  if (!r.ok) throw new Error(path + ' -> ' + r.status);
  return r.json();
}

// ── Map ────────────────────────────────────────────────────────────
const map = L.map('map', { zoomSnap: 0 }).setView([31.82, -106.45], 10);
L.maplibreGL({
  style: 'https://tiles.openfreemap.org/styles/dark',
  attribution: '&copy; <a href="https://openfreemap.org">OpenFreeMap</a> ' +
    '&copy; <a href="https://www.openstreetmap.org/copyright">OSM</a>, ' +
    'style &copy; <a href="https://carto.com/attributions">CARTO</a>'
}).addTo(map);

function magRadius(m) { return Math.max(5, 3.5 * ((m ?? 0.5) + 1.2)); }

// ── Waveform drawing ───────────────────────────────────────────────
function drawTrace(canvas, trace, picks) {
  const dpr = window.devicePixelRatio || 1;
  const W = canvas.clientWidth * dpr, H = 84 * dpr;
  canvas.width = W; canvas.height = H;
  const ctx = canvas.getContext('2d');
  const mm = trace.minmax, n = mm.length, mid = H / 2, amp = H * 0.42;

  // envelope fill between per-bin min and max
  ctx.beginPath();
  for (let i = 0; i < n; i++) ctx.lineTo(W * i / n, mid - mm[i][1] * amp);
  for (let i = n - 1; i >= 0; i--) ctx.lineTo(W * i / n, mid - mm[i][0] * amp);
  ctx.closePath();
  ctx.fillStyle = 'rgba(91,157,217,0.85)';
  ctx.fill();

  // pick markers for this station (P solid red, S green)
  const t1 = trace.t0 + trace.dt * n;
  for (const p of picks.filter(p => p.station === trace.station)) {
    const x = W * (p.t - trace.t0) / (t1 - trace.t0);
    if (x < 0 || x > W) continue;
    ctx.strokeStyle = p.phase === 'P' ? '#ef5350' : '#66bb6a';
    ctx.lineWidth = dpr;
    ctx.setLineDash(p.phase === 'P' ? [] : [4 * dpr, 3 * dpr]);
    ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, H); ctx.stroke();
    ctx.setLineDash([]);
    ctx.fillStyle = ctx.strokeStyle;
    ctx.font = `${11 * dpr}px sans-serif`;
    ctx.fillText(p.phase, x + 3 * dpr, 12 * dpr);
  }
}

// ── Event detail panel ─────────────────────────────────────────────
async function showEvent(id) {
  const ev = await loadJSON(`data/events/${id}.json`);
  document.getElementById('detail-hint').style.display = 'none';
  document.getElementById('detail-title').textContent =
    `${TYPE_LABEL[ev.event_type] || ev.event_type} — M${(ev.magnitude ?? 0).toFixed(1)}`;
  document.getElementById('detail-meta').innerHTML =
    `<b>${ev.time.replace('T', ' ').slice(0, 19)} UTC</b> · ` +
    `${ev.latitude.toFixed(3)}, ${ev.longitude.toFixed(3)} · ` +
    `${ev.num_picks} picks · ${ev.traces.length} stations · ` +
    `<span style="color:#7c8798">${ev.event_id}</span>`;

  const waves = document.getElementById('detail-waves');
  waves.innerHTML = '';
  for (const tr of ev.traces) {
    const div = document.createElement('div');
    div.className = 'trace';
    div.innerHTML = `<div class="trace-label">${tr.network}.${tr.station} · ` +
      `${tr.distance_km} km</div><canvas></canvas>`;
    waves.appendChild(div);
    drawTrace(div.querySelector('canvas'), tr, ev.picks);
  }

  document.querySelectorAll('.ev-row').forEach(r =>
    r.classList.toggle('active', r.dataset.id === id));
  if (markers[id]) markers[id].openPopup();
  history.replaceState(null, '', '#' + id);
}

// ── Boot ───────────────────────────────────────────────────────────
(async function init() {
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

  const list = document.getElementById('event-list');
  for (const ev of catalog) {
    const isEq = ev.event_type === 'earthquake';
    const m = L.circleMarker([ev.latitude, ev.longitude], {
      radius: magRadius(ev.magnitude),
      color: isEq ? BLUE : ACCENT, weight: 1.5,
      fillColor: isEq ? BLUE : ACCENT, fillOpacity: 0.45,
    }).addTo(map).bindPopup(
      `<b>${TYPE_LABEL[ev.event_type]}</b> M${(ev.magnitude ?? 0).toFixed(1)}` +
      `<br>${ev.time.replace('T', ' ').slice(0, 16)} UTC`);
    m.on('click', () => showEvent(ev.event_id));
    markers[ev.event_id] = m;

    const row = document.createElement('div');
    row.className = 'ev-row';
    row.dataset.id = ev.event_id;
    row.innerHTML =
      `<span class="ev-date">${ev.time.slice(0, 10)}</span>` +
      `<span>${TYPE_LABEL[ev.event_type]}</span>` +
      `<span class="ev-mag ${TYPE_CLASS[ev.event_type] || ''}">` +
      `M${(ev.magnitude ?? 0).toFixed(1)}</span>`;
    row.addEventListener('click', () => showEvent(ev.event_id));
    list.appendChild(row);
  }

  // deep link: index.html#<event_id>
  const want = location.hash.slice(1);
  if (want && catalog.some(e => e.event_id === want)) showEvent(want);
})();
