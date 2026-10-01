/* El Paso Seismic Network — shared waveform drawing.
 *
 * Split out of site.js so more than one page can draw traces. index.html
 * uses it for the detail panel; event.html uses it for the full-page view.
 * It owns nothing page-specific: no map, no event list, no routing.
 *
 * Load this FIRST on any page that shows a waveform. waves.js (the
 * interactive explainer) reads `currentEvent` and `SHOW_RG` from here.
 */

const TYPE_CLASS = { quarry_blast: 'blast', earthquake: 'eq' };

/* Event type in the reader's language. Keep calling this rather than
 * caching the string — it has to change when the language toggles. */
const typeLabel = kind =>
  kind === 'earthquake' ? t('type.quake') : t('type.blast');

/* The two validated categorical slots — see charts.js and the README. */
const BLAST = '#04a14a', QUAKE = '#e307dc';

/* Rg is switched off for now. Flip this back to true to restore it
 * everywhere — the move-out guide below, and the Rg window in the
 * interactive wave explainer (waves.js reads this flag). The explainer
 * SECTION was removed from index.html and would need putting back too. */
const SHOW_RG = false;

/* Move-out guides. A phase travelling at velocity v reaches a station
 * distance_km away at t = distance/v, so on a distance-sorted panel each
 * phase traces a straight line. These are nominal crustal velocities, not
 * a velocity model fitted to this network — they place the guides within a
 * few tenths of a second, which is all they are for. */
const GUIDES = [
  { name: 'P',  v: 6.0, color: '#ff6b6b' },
  { name: 'S',  v: 3.5, color: '#7ee787' },
  { name: 'Rg', v: 1.8, color: '#ffd23f' },
].filter(g => g.name !== 'Rg' || SHOW_RG);

const TRACE_INK = 'rgba(34,195,230,0.95)';

let currentEvent = null, showGuides = false;

async function loadJSON(path) {
  const r = await fetch(path);
  if (!r.ok) throw new Error(path + ' -> ' + r.status);
  return r.json();
}

// ── One trace, one canvas ──────────────────────────────────────────
function drawTrace(canvas, trace, picks, height = 84) {
  const dpr = window.devicePixelRatio || 1;
  const W = canvas.clientWidth * dpr, H = height * dpr;
  canvas.width = W; canvas.height = H;
  const ctx = canvas.getContext('2d');
  const mm = trace.minmax, n = mm.length, mid = H / 2, amp = H * 0.42;

  // envelope fill between per-bin min and max
  ctx.beginPath();
  for (let i = 0; i < n; i++) ctx.lineTo(W * i / n, mid - mm[i][1] * amp);
  for (let i = n - 1; i >= 0; i--) ctx.lineTo(W * i / n, mid - mm[i][0] * amp);
  ctx.closePath();
  ctx.fillStyle = TRACE_INK;
  ctx.fill();

  const t1 = trace.t0 + trace.dt * n;
  const xOf = t => W * (t - trace.t0) / (t1 - trace.t0);

  // predicted move-out for each phase, off by default (see GUIDES)
  if (showGuides) {
    for (const g of GUIDES) {
      const x = xOf(trace.distance_km / g.v);
      if (x < 0 || x > W) continue;
      ctx.strokeStyle = g.color;
      ctx.globalAlpha = 0.55;
      ctx.lineWidth = dpr;
      ctx.setLineDash([2 * dpr, 4 * dpr]);
      ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, H); ctx.stroke();
      ctx.setLineDash([]);
      ctx.globalAlpha = 1;
      ctx.fillStyle = g.color;
      ctx.font = `${10 * dpr}px sans-serif`;
      ctx.fillText(g.name, x + 2 * dpr, H - 4 * dpr);
    }
  }

  // pick markers for this station (P solid red, S green)
  for (const p of picks.filter(p => p.station === trace.station)) {
    const x = xOf(p.t);
    if (x < 0 || x > W) continue;
    ctx.strokeStyle = p.phase === 'P' ? '#ff6b6b' : '#7ee787';
    ctx.lineWidth = dpr;
    ctx.setLineDash(p.phase === 'P' ? [] : [4 * dpr, 3 * dpr]);
    ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, H); ctx.stroke();
    ctx.setLineDash([]);
    ctx.fillStyle = ctx.strokeStyle;
    ctx.font = `${11 * dpr}px sans-serif`;
    ctx.fillText(p.phase, x + 3 * dpr, 12 * dpr);
  }
}

// ── The stack of traces ────────────────────────────────────────────
// Traces come sorted by distance, so the stack doubles as a small record
// section: the further down you read, the further the station.
function renderWaves(hostId = 'detail-waves', height = 84) {
  const waves = document.getElementById(hostId);
  if (!waves || !currentEvent) return;
  waves.innerHTML = '';
  currentEvent.traces.forEach((tr, i) => {
    const div = document.createElement('div');
    div.className = 'trace';
    // waves.js reads the index back to find this trace's timing + picks
    div.dataset.idx = i;
    div.tabIndex = 0;
    div.setAttribute('role', 'button');
    div.setAttribute('aria-label',
      `Waveform from station ${tr.network}.${tr.station}, ${tr.distance_km} ` +
      `kilometres away. Explore what each part of this wave is.`);
    div.innerHTML =
      `<div class="trace-label">${tr.network}.${tr.station} · ` +
      `${tr.distance_km} km</div>` +
      `<div class="trace-plot">` +
        `<canvas></canvas>` +
        `<div class="wave-region" hidden></div>` +
        `<div class="wave-cursor" hidden></div>` +
        `<div class="wave-readout" hidden></div>` +
      `</div>`;
    waves.appendChild(div);
    drawTrace(div.querySelector('canvas'), tr, currentEvent.picks, height);
  });
  if (typeof wireWaves === 'function') wireWaves(hostId);
}
