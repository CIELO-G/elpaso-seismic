/* El Paso Seismic Network — the single-event page.
 *
 * Reads an event id from the URL hash (event.html#ep20251122-0001) and
 * gives that one event the room the sidebar panel can't: a proper record
 * section, every trace at full height, the picks, and the distance working.
 *
 * Loads waveforms.js and waves.js, NOT site.js — there is no catalog map
 * here, and site.js builds one unconditionally.
 */

const EV_TZ = 'America/Denver';
const RECORD_H = 420;          // css px for the record-section canvas

const localFmt = () => new Intl.DateTimeFormat(
  document.documentElement.lang || 'en',
  { timeZone: EV_TZ, dateStyle: 'medium', timeStyle: 'short' });

const esc = s => String(s).replace(/[&<>"]/g,
  c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));

// ── Record section ─────────────────────────────────────────────────
// Distance up the y axis, time along x. A phase with velocity v satisfies
// d = v*t, so on these axes it is a straight line through the origin —
// which is the whole point of drawing it this way: the fan IS the physics.
function drawRecordSection(canvas, ev) {
  const dpr = window.devicePixelRatio || 1;
  const W = canvas.clientWidth * dpr, H = RECORD_H * dpr;
  canvas.width = W; canvas.height = H;
  const ctx = canvas.getContext('2d');

  const padL = 52 * dpr, padR = 16 * dpr, padT = 18 * dpr, padB = 34 * dpr;
  const plotW = W - padL - padR, plotH = H - padT - padB;

  const traces = ev.traces;
  const tMin = Math.min(...traces.map(t => t.t0));
  const tMax = Math.max(...traces.map(t => t.t0 + t.dt * t.minmax.length));
  const dMax = Math.max(...traces.map(t => t.distance_km)) * 1.12;

  const x = t => padL + plotW * (t - tMin) / (tMax - tMin);
  const y = d => padT + plotH * (1 - d / dMax);

  ctx.fillStyle = '#0c0c0c';
  ctx.fillRect(0, 0, W, H);

  // ── grid + axes
  ctx.font = `${10 * dpr}px ui-monospace, monospace`;
  ctx.strokeStyle = '#26282c'; ctx.lineWidth = dpr;
  ctx.fillStyle = '#9aa3ae';

  const tStep = tMax > 60 ? 20 : tMax > 30 ? 10 : 5;
  ctx.textAlign = 'center';
  for (let t = 0; t <= tMax; t += tStep) {
    if (t < tMin) continue;
    ctx.beginPath(); ctx.moveTo(x(t), padT); ctx.lineTo(x(t), padT + plotH); ctx.stroke();
    ctx.fillText(t + 's', x(t), H - 12 * dpr);
  }
  const dStep = dMax > 80 ? 25 : dMax > 40 ? 20 : 10;
  ctx.textAlign = 'right';
  for (let d = 0; d <= dMax; d += dStep) {
    ctx.beginPath(); ctx.moveTo(padL, y(d)); ctx.lineTo(W - padR, y(d)); ctx.stroke();
    ctx.fillText(d + ' km', padL - 8 * dpr, y(d) + 3.5 * dpr);
  }

  ctx.textAlign = 'center';
  ctx.fillText('seconds after the event', padL + plotW / 2, H - 1 * dpr);

  // ── move-out lines: d = v*t, straight through the origin
  for (const g of GUIDES) {
    ctx.strokeStyle = g.color; ctx.globalAlpha = 0.5;
    ctx.setLineDash([5 * dpr, 4 * dpr]); ctx.lineWidth = 1.5 * dpr;
    ctx.beginPath();
    ctx.moveTo(x(0), y(0));
    ctx.lineTo(x(dMax / g.v), y(dMax));
    ctx.stroke();
    ctx.setLineDash([]); ctx.globalAlpha = 1;

    // label it where it leaves the top of the plot
    ctx.fillStyle = g.color; ctx.textAlign = 'left';
    ctx.font = `${11 * dpr}px ui-monospace, monospace`;
    const lx = Math.min(x(dMax / g.v) + 4 * dpr, W - padR - 18 * dpr);
    ctx.fillText(g.name, lx, padT + 12 * dpr);
  }

  // ── one wiggle per station, centred on its own distance
  const rowH = Math.min(34 * dpr, plotH / (traces.length * 1.6));
  let lastLabelY = -Infinity;          // stations at similar distances collide
  for (const tr of traces) {
    const mm = tr.minmax, n = mm.length;
    const yc = y(tr.distance_km);
    const tOf = i => tr.t0 + i * tr.dt;

    ctx.beginPath();
    for (let i = 0; i < n; i++) ctx.lineTo(x(tOf(i)), yc - mm[i][1] * rowH);
    for (let i = n - 1; i >= 0; i--) ctx.lineTo(x(tOf(i)), yc - mm[i][0] * rowH);
    ctx.closePath();
    ctx.fillStyle = TRACE_INK;
    ctx.fill();

    // Station label above its own trace — but two stations at similar
    // distances sit almost on top of each other, so drop the second one
    // below its trace instead of letting the two labels overprint.
    ctx.fillStyle = '#eef1f4'; ctx.textAlign = 'left';
    ctx.font = `${10 * dpr}px ui-monospace, monospace`;
    const above = yc - rowH - 4 * dpr;
    const ly = Math.abs(above - lastLabelY) < 13 * dpr
      ? yc + rowH + 11 * dpr : above;
    ctx.fillText(tr.station, padL + 4 * dpr, ly);
    lastLabelY = ly;

    // the analyst's picks, as dots on this station's line
    for (const p of ev.picks.filter(p => p.station === tr.station)) {
      ctx.fillStyle = p.phase === 'P' ? '#ff6b6b' : '#7ee787';
      ctx.beginPath();
      ctx.arc(x(p.t), yc, 4 * dpr, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = '#0c0c0c'; ctx.lineWidth = 2 * dpr;
      ctx.stroke();
    }
  }
}

// ── Page content ───────────────────────────────────────────────────
function renderHead(ev) {
  const evTime = new Date(ev.time);     // not `t` - that name is the translator
  const label = typeLabel(ev.event_type);

  document.title = `${label} M${(ev.magnitude ?? 0).toFixed(1)} — El Paso Seismic Network`;
  document.getElementById('ev-eyebrow').textContent =
    label + ' · ' + ev.event_id;
  document.getElementById('ev-title').textContent =
    `${label} — M${(ev.magnitude ?? 0).toFixed(1)}`;
  const where = describePlace(ev.latitude, ev.longitude);
  document.getElementById('ev-sub').textContent =
    (where ? where + ' · ' : '') +
    `${localFmt().format(evTime)} ${t('event.localTime')} · ` +
    `${ev.time.replace('T', ' ').slice(0, 19)} UTC`;

  const facts = [
    [t('event.magnitude'), ev.magnitude == null ? '—' : 'M' + ev.magnitude.toFixed(2)],
    [t('event.location'), `${ev.latitude.toFixed(3)}, ${ev.longitude.toFixed(3)}`],
    [t('event.stations'), ev.traces.length],
    [t('event.phasePicks'), ev.num_picks],
    [t('event.nearest'), Math.min(...ev.traces.map(x => x.distance_km)).toFixed(1) + ' km'],
    [t('event.furthest'), Math.max(...ev.traces.map(x => x.distance_km)).toFixed(1) + ' km'],
  ];
  document.getElementById('ev-facts').innerHTML = facts
    .map(([k, v]) => `<div><dt>${esc(k)}</dt><dd>${esc(v)}</dd></div>`).join('');
}

function renderPicks(ev) {
  const rows = ev.picks
    .map(p => {
      const tr = ev.traces.find(t => t.station === p.station);
      return { ...p, d: tr ? tr.distance_km : null };
    })
    .sort((a, b) => (a.d ?? 1e9) - (b.d ?? 1e9) || a.phase.localeCompare(b.phase));

  document.getElementById('picks-table').innerHTML =
    `<thead><tr><th>${t('event.thStation')}</th><th>${t('event.thPhase')}</th>` +
    `<th>${t('event.thArrival')}</th><th>${t('event.thDistance')}</th></tr></thead>` +
    `<tbody>${rows.map(r => `<tr>
       <td>${esc(r.station)}</td>
       <td><span class="phase ${r.phase === 'P' ? 'p' : 's'}">${esc(r.phase)}</span></td>
       <td class="num">+${r.t.toFixed(2)} s</td>
       <td class="num">${r.d == null ? '—' : r.d.toFixed(1) + ' km'}</td>
     </tr>`).join('')}</tbody>`;

  // The single-station distance rule, worked through on this event's own
  // numbers. It assumes a deep crustal path, so it overshoots for nearby
  // stations whose waves stay in slower shallow rock — say so rather than
  // printing a number that just looks wrong next to the located distance.
  const vp = GUIDES.find(g => g.name === 'P')?.v ?? 6.0;
  const vs = GUIDES.find(g => g.name === 'S')?.v ?? 3.5;
  const k = (vp * vs) / (vp - vs);

  const pairs = ev.traces.map(tr => {
    const mine = ev.picks.filter(p => p.station === tr.station);
    const P = mine.find(p => p.phase === 'P')?.t;
    const S = mine.find(p => p.phase === 'S')?.t;
    return (P != null && S != null) ? { tr, sp: S - P } : null;
  }).filter(Boolean);

  const host = document.getElementById('sp-working');
  if (!pairs.length) { host.innerHTML = ''; return; }

  host.innerHTML =
    `<div class="working">
       <h3>${t('event.spH3')}</h3>
       <p>${t('event.spBody', { k: k.toFixed(1), vp, vs })}</p>
       <table class="picks-table"><thead><tr>
         <th>${t('event.thStation')}</th><th>S&minus;P</th>
         <th>${t('event.thEstimated')}</th><th>${t('event.thLocated')}</th><th></th>
       </tr></thead><tbody>${pairs.map(({ tr, sp }) => {
         const est = sp * k;
         const off = Math.abs(est - tr.distance_km) / tr.distance_km;
         return `<tr>
           <td>${esc(tr.station)}</td>
           <td class="num">${sp.toFixed(2)} s</td>
           <td class="num">${est.toFixed(0)} km</td>
           <td class="num">${tr.distance_km.toFixed(1)} km</td>
           <td class="${off <= 0.2 ? 'ok' : 'off'}">${off <= 0.2
             ? t('event.spClose') : '+' + Math.round(off * 100) + '%'}</td></tr>`;
       }).join('')}</tbody></table>
       <p class="chart-note">${t('event.spNote')}</p>
     </div>`;
}

function renderLocator(ev, stations) {
  const used = new Set(ev.traces.map(t => t.station));
  const map = L.map('event-map', { zoomSnap: 0, scrollWheelZoom: false });
  L.maplibreGL({
    style: 'https://tiles.openfreemap.org/styles/dark',
    attribution: '&copy; <a href="https://openfreemap.org">OpenFreeMap</a> ' +
      '&copy; <a href="https://www.openstreetmap.org/copyright">OSM</a>, ' +
      'style &copy; <a href="https://carto.com/attributions">CARTO</a>',
  }).addTo(map);

  const pts = [[ev.latitude, ev.longitude]];
  for (const s of stations) {
    if (!used.has(s.station)) continue;          // only stations that recorded it
    pts.push([s.latitude, s.longitude]);
    L.marker([s.latitude, s.longitude], {
      icon: L.divIcon({ className: 'sta-icon', iconSize: [12, 9] }),
      title: `${s.network}.${s.station}`,
    }).addTo(map).bindPopup(`<b>${s.network}.${s.station}</b><br>${s.model}`);
    L.polyline([[ev.latitude, ev.longitude], [s.latitude, s.longitude]], {
      color: '#c9d1d9', weight: 1, opacity: 0.3, dashArray: '3 4',
    }).addTo(map);
  }

  const isEq = ev.event_type === 'earthquake';
  L.circleMarker([ev.latitude, ev.longitude], {
    radius: Math.max(7, 3.5 * ((ev.magnitude ?? 0.5) + 1.2)),
    color: isEq ? QUAKE : BLAST, weight: 2, opacity: 1,
    fillColor: isEq ? QUAKE : BLAST, fillOpacity: 0.6,
  }).addTo(map).bindPopup(`<b>${typeLabel(ev.event_type)}</b>`);

  map.fitBounds(L.latLngBounds(pts).pad(0.25));

  document.getElementById('locator-sub').textContent =
    t('event.whereSub', { n: used.size });

  // depth is exported but poorly resolved — say so rather than charting it
  const d = ev.depth_km;
  document.getElementById('depth-note').textContent = d == null ? '' :
    t('event.depthNote', { d: d.toFixed(2) });
}

function fail(msg) {
  document.getElementById('ev-title').textContent = t('event.notFound');
  document.getElementById('ev-sub').textContent = msg;
  for (const id of ['record', 'traces', 'picks', 'locator']) {
    const el = document.getElementById(id);
    if (el) el.hidden = true;
  }
}

// ── Boot ───────────────────────────────────────────────────────────
(async function initEventPage() {
  const id = decodeURIComponent(location.hash.slice(1));
  if (!id) {
    fail(t('event.noId'));
    return;
  }

  let ev, stations, meta;
  try {
    [ev, stations, meta] = await Promise.all([
      loadJSON(`data/events/${id}.json`),
      loadJSON('data/stations.json'),
      loadJSON('data/meta.json'),
    ]);
  } catch {
    fail(t('event.badId', { id }));
    return;
  }

  currentEvent = ev;
  renderHead(ev);
  renderPicks(ev);

  const canvas = document.getElementById('record-canvas');
  drawRecordSection(canvas, ev);

  const spread = Math.max(...ev.traces.map(x => x.distance_km)) -
                 Math.min(...ev.traces.map(x => x.distance_km));
  const paintRecordNote = () => {
    document.getElementById('record-note').textContent =
      ev.traces.length < 3
        ? t('event.recordNoteFew', { n: ev.traces.length })
        : t('event.recordNote', { n: ev.traces.length, km: spread.toFixed(0) });
  };
  paintRecordNote();

  renderWaves('detail-waves', 96);

  const toggle = document.getElementById('guide-toggle');
  if (toggle) {
    toggle.addEventListener('change', () => {
      showGuides = toggle.checked;
      renderWaves('detail-waves', 96);
    });
  }

  renderLocator(ev, stations);

  document.getElementById('updated').textContent = t('fresh.updated',
    { date: new Intl.DateTimeFormat(document.documentElement.lang || 'en',
        { dateStyle: 'long' }).format(new Date(meta.generated_utc)) });

  // canvases size from clientWidth, so both need a redraw on resize
  let rt;
  window.addEventListener('resize', () => {
    clearTimeout(rt);
    rt = setTimeout(() => {
      drawRecordSection(canvas, ev);
      renderWaves('detail-waves', 96);
    }, 150);
  });

  onLangChange(() => {
    applyI18n();
    renderHead(ev);
    renderPicks(ev);
    renderWaves('detail-waves', 96);
    paintRecordNote();
    document.getElementById('locator-sub').textContent =
      t('event.whereSub', { n: new Set(ev.traces.map(x => x.station)).size });
    const dn = document.getElementById('depth-note');
    if (dn && ev.depth_km != null) {
      dn.textContent = t('event.depthNote', { d: ev.depth_km.toFixed(2) });
    }
  });

  // following a link to a different event on the same page
  window.addEventListener('hashchange', () => location.reload());
})();
