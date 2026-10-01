/* El Paso Seismic Network — interactive waveform explainer.
 *
 * Turns each trace in the event panel into something you can explore:
 * hover (or arrow-key) along it and the page tells you what part of the
 * wave you are on, shades that window, and on click explains it properly.
 *
 * The phase boundaries come from the event's own PICKS wherever the
 * analyst made one. Only when a pick is missing do we fall back to a
 * predicted arrival (distance / velocity, the same nominal velocities the
 * move-out guides use). The readout says which of the two it is — a
 * predicted arrival is a guess and shouldn't be dressed up as a
 * measurement.
 *
 * Loaded last; site.js calls wireWaves() after it renders the traces.
 */

/* Phase copy lives in i18n.js; this maps a region to its keys so the
 * explainer re-reads them whenever the language changes. */
const PHASE_KEYS = {
  noise: 'wave.noise', p: 'wave.p', s: 'wave.s', coda: 'wave.coda',
  rg: 'wave.rg',
};

const VEL = { p: 6.0, s: 3.5, rg: 1.8 };   // same nominals as the guides

// ── Geometry ───────────────────────────────────────────────────────
function traceFor(el) {
  const div = el.closest('.trace');
  if (!div || !currentEvent) return null;
  const tr = currentEvent.traces[+div.dataset.idx];
  return tr ? { div, tr } : null;
}

function windowOf(tr) {
  const t0 = tr.t0, t1 = tr.t0 + tr.dt * tr.minmax.length;
  return { t0, t1, span: t1 - t0 };
}

// Measured pick if the analyst made one, else a predicted arrival.
function arrivals(tr) {
  const picks = (currentEvent?.picks || []).filter(p => p.station === tr.station);
  const pick = ph => picks.find(p => p.phase === ph)?.t ?? null;
  const P = pick('P'), S = pick('S');
  return {
    p:  P ?? tr.distance_km / VEL.p,   pMeasured: P !== null,
    s:  S ?? tr.distance_km / VEL.s,   sMeasured: S !== null,
    rg: tr.distance_km / VEL.rg,       rgMeasured: false,
  };
}

// Where the S train gives way to the tail: the Rg arrival when Rg is being
// shown and lands inside the window, otherwise twice the S travel time —
// the usual convention for the start of a coda window.
function codaStart(tr) {
  const a = arrivals(tr), { t1 } = windowOf(tr);
  return (SHOW_RG && a.rg < t1) ? a.rg : a.s * 2;
}

const tailKind = tr =>
  (SHOW_RG && arrivals(tr).rg < windowOf(tr).t1) ? 'rg' : 'coda';

function regionAt(t, tr) {
  const a = arrivals(tr);
  if (t < a.p) return 'noise';
  if (t < a.s) return 'p';
  if (t < codaStart(tr)) return 's';
  return tailKind(tr);
}

// Pixel bounds of a region, as fractions of the plot width.
function regionBounds(kind, tr) {
  const a = arrivals(tr), { t0, span } = windowOf(tr);
  const f = t => Math.max(0, Math.min(1, (t - t0) / span));
  if (kind === 'noise') return [0, f(a.p)];
  if (kind === 'p')     return [f(a.p), f(a.s)];
  if (kind === 's')     return [f(a.s), f(codaStart(tr))];
  return [f(codaStart(tr)), 1];                          // rg or coda
}

const fmtSecs = t => (t >= 0 ? '+' : '') + t.toFixed(1) + ' s';

const regionShort = kind => t('wave.region.' + kind);

// ── Cursor + shaded region ─────────────────────────────────────────
function paintCursor(div, frac) {
  const { tr } = traceFor(div);
  const { t0, span } = windowOf(tr);
  const tNow = t0 + frac * span;          // not `t` — that is the translator
  const kind = regionAt(tNow, tr);

  const cur = div.querySelector('.wave-cursor');
  const reg = div.querySelector('.wave-region');
  const out = div.querySelector('.wave-readout');

  cur.style.left = (frac * 100).toFixed(2) + '%';
  cur.hidden = false;

  const [a, b] = regionBounds(kind, tr);
  reg.style.left = (a * 100).toFixed(2) + '%';
  reg.style.width = ((b - a) * 100).toFixed(2) + '%';
  reg.hidden = false;

  out.textContent = `${fmtSecs(tNow)} · ${regionShort(kind)}`;
  // keep the chip inside the plot instead of letting it run off an edge
  out.style.left = (Math.min(88, Math.max(2, frac * 100))).toFixed(2) + '%';
  out.hidden = false;

  div.dataset.frac = frac;
  return kind;
}

function clearCursor(div) {
  div.querySelectorAll('.wave-cursor, .wave-region, .wave-readout')
    .forEach(el => { el.hidden = true; });
}

// ── Explainer panel ────────────────────────────────────────────────
function showWaveExplainer(div, kind) {
  const host = document.getElementById('wave-explainer');
  if (!host) return;
  const { tr } = traceFor(div);
  const a = arrivals(tr);
  const key = PHASE_KEYS[kind] || PHASE_KEYS.coda;
  const info = { title: t(key + '.title'), body: t(key + '.body') };

  // facts drawn from this trace, so the explanation is about what the
  // reader is actually looking at
  const facts = [];
  if (kind === 'p' || kind === 's') {
    const at = kind === 'p' ? a.p : a.s;
    const measured = kind === 'p' ? a.pMeasured : a.sMeasured;
    facts.push(t('wave.fact.arrival', {
      kind: measured ? t('wave.fact.picked') : t('wave.fact.predicted'),
      t: fmtSecs(at), d: tr.distance_km,
    }));
  }
  if (kind === 'rg') {
    facts.push(`Rg would reach this station near ${fmtSecs(a.rg)} ` +
      `at ${VEL.rg} km/s (predicted, not picked)`);
  }
  if (a.pMeasured && a.sMeasured) {
    // The classic single-station rule: distance ~ (S-P) * Vp*Vs/(Vp-Vs),
    // which is 8.4 km/s for the nominal 6.0 / 3.5. It assumes a whole-crust
    // path, so it overshoots badly for near stations whose rays stay in
    // slower shallow rock. Say so rather than printing a number that looks
    // simply wrong next to the located distance.
    const sp = a.s - a.p;
    const est = sp * (VEL.p * VEL.s) / (VEL.p - VEL.s);
    const off = Math.abs(est - tr.distance_km) / tr.distance_km;
    facts.push(t('wave.fact.sp', { sp: sp.toFixed(2) }));
    facts.push(t(off <= 0.2 ? 'wave.fact.spClose' : 'wave.fact.spOff',
      { est: est.toFixed(0), real: tr.distance_km }));
  }

  host.innerHTML =
    `<div class="we-head">
       <span class="we-dot ${kind}" aria-hidden="true"></span>
       <h3>${info.title}</h3>
       <button type="button" class="we-close" aria-label="${t('wave.close')}">×</button>
     </div>
     <p class="we-body">${info.body}</p>` +
    (facts.length
      ? `<ul class="we-facts">${facts.map(f => `<li>${f}</li>`).join('')}</ul>`
      : '') +
    `<p class="we-station">${tr.network}.${tr.station} · ${tr.distance_km} km</p>`;

  host.hidden = false;
  host.querySelector('.we-close').addEventListener('click', hideWaveExplainer);

  const live = document.getElementById('live-status');
  if (live) live.textContent = info.title + '. ' + info.body;
}

function hideWaveExplainer() {
  const host = document.getElementById('wave-explainer');
  if (host) { host.hidden = true; host.innerHTML = ''; }
}

// ── Wiring ─────────────────────────────────────────────────────────
// Re-run on every render; listeners go on the container once. Tracked per
// container id, because event.html wires a different host than index.html.
const wavesWired = new Set();

function wireWaves(hostId = 'detail-waves') {
  const host = document.getElementById(hostId);
  if (!host || wavesWired.has(hostId)) return;
  wavesWired.add(hostId);

  const fracFrom = (e, plot) => {
    const r = plot.getBoundingClientRect();
    return Math.max(0, Math.min(1, (e.clientX - r.left) / r.width));
  };

  host.addEventListener('mousemove', e => {
    const plot = e.target.closest('.trace-plot');
    if (!plot) return;
    paintCursor(plot.closest('.trace'), fracFrom(e, plot));
  });

  host.addEventListener('mouseleave', () => {
    host.querySelectorAll('.trace').forEach(clearCursor);
  }, true);

  host.addEventListener('click', e => {
    const plot = e.target.closest('.trace-plot');
    if (!plot) return;
    const div = plot.closest('.trace');
    showWaveExplainer(div, paintCursor(div, fracFrom(e, plot)));
  });

  // Keyboard: focus a trace, arrow along it, Enter to explain.
  host.addEventListener('keydown', e => {
    const div = e.target.closest('.trace');
    if (!div) return;
    const step = e.shiftKey ? 0.1 : 0.02;
    let frac = Number(div.dataset.frac ?? 0.5);

    if (e.key === 'ArrowRight' || e.key === 'ArrowLeft') {
      e.preventDefault();
      frac = Math.max(0, Math.min(1, frac + (e.key === 'ArrowRight' ? step : -step)));
      const kind = paintCursor(div, frac);
      const live = document.getElementById('live-status');
      if (live) {
        const { tr } = traceFor(div), { t0, span } = windowOf(tr);
        live.textContent = `${fmtSecs(t0 + frac * span)}, ${regionShort(kind)}`;
      }
    } else if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      showWaveExplainer(div, paintCursor(div, frac));
    } else if (e.key === 'Escape') {
      hideWaveExplainer();
      clearCursor(div);
    }
  });

  host.addEventListener('focusout', e => {
    const div = e.target.closest('.trace');
    if (div && !div.contains(e.relatedTarget)) clearCursor(div);
  });
}
