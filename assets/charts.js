/* El Paso Seismic Network — activity charts.
 *
 * Renders four charts from the shared catalog in filters.js:
 *   #chart-hour   time of day, local  — the headline chart
 *   #chart-dow    day of week, local
 *   #chart-month  events per month
 *   #chart-mag    magnitude distribution
 *
 * All binning is done in El Paso local time (America/Denver), because the
 * point of these charts is the human work schedule behind the blasts —
 * a UTC histogram would smear the pattern across the DST boundary.
 *
 * Bar heights come from chartSubset(): everything passing the site and
 * search filters, but NOT the bar selection. So picking Site B redraws
 * these histograms for that quarry alone, while picking a bar only dims
 * its neighbours instead of collapsing the chart to a single column.
 */

/* The two categorical slots. Stepped to clear 3:1 on BOTH surfaces the
 * site uses — the near-black map and the light page — so an event is the
 * same colour wherever it appears. Checked with tools/validate_palette.py
 * against each surface. Re-run it before changing them. */
const C_BLAST = '#04a14a', C_QUAKE = '#e307dc';

const BAR_MAX = 24;   // bars are capped, never fill their slot
const GAP = 2;        // surface gap between touching stacked segments
const R = 4;          // rounded data-end; square at the baseline

const DOW = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
const MON = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
  'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

let shown = [];    // the subset the bars are drawn from
let tip = null;

// ── Bar chart ──────────────────────────────────────────────────────
// bars: [{ key, label, blast, quake, tip }]  — stacked, blasts below.
// A column with a rounded top and a square foot on the baseline.
function columnPath(x, y, w, h, r) {
  const rr = Math.max(0, Math.min(r, w / 2, h));
  return `M${x} ${y + h} L${x} ${y + rr} Q${x} ${y} ${x + rr} ${y} ` +
         `L${x + w - rr} ${y} Q${x + w} ${y} ${x + w} ${y + rr} ` +
         `L${x + w} ${y + h} Z`;
}

function renderBars(host, { bars, height, tickEvery = 1, band = null, chart,
                            peakLabel = false, divideAt = null }) {
  const W = Math.max(host.clientWidth, 240), H = height;
  // extra headroom on top when a direct label rides the tallest column
  const padL = 28, padR = 8, padT = peakLabel ? 30 : 12, padB = 24;
  const plotW = W - padL - padR, plotH = H - padT - padB;

  const peak = Math.max(1, ...bars.map(b => b.blast + b.quake));
  const step = peak <= 5 ? 1 : peak <= 12 ? 2 : peak <= 30 ? 5 : 10;
  const yMax = Math.ceil(peak / step) * step;
  const y = v => padT + plotH - (v / yMax) * plotH;

  const slot = plotW / bars.length;
  const barW = Math.max(3, Math.min(BAR_MAX, slot - 3, slot * 0.72));

  const out = [];
  // a group, not an img: an img hides its children, and the bars are buttons
  const title = host.closest('figure')?.querySelector('h2, h3')?.textContent.trim() || '';
  out.push(`<svg viewBox="0 0 ${W} ${H}" width="${W}" height="${H}" role="group" ` +
    `aria-label="${title}">`);

  // shaded context band (used on the time-of-day chart for working hours)
  if (band) {
    const x0 = padL + band.from * slot, x1 = padL + band.to * slot;
    out.push(`<rect class="band" x="${x0.toFixed(1)}" y="${padT}" ` +
      `width="${(x1 - x0).toFixed(1)}" height="${plotH}"/>`);
    out.push(`<text class="band-label" x="${(x0 + 6).toFixed(1)}" ` +
      `y="${padT + 12}">${band.label}</text>`);
  }

  // horizontal gridlines double as the y scale
  for (let v = 0; v <= yMax; v += step) {
    out.push(`<line class="grid" x1="${padL}" x2="${W - padR}" ` +
      `y1="${y(v).toFixed(1)}" y2="${y(v).toFixed(1)}"/>`);
    out.push(`<text class="ytick" x="${padL - 6}" y="${(y(v) + 4).toFixed(1)}">${v}</text>`);
  }

  // faint rules between groups of bars (the month chart's years)
  if (divideAt) {
    bars.forEach((b, i) => {
      if (i === 0 || !divideAt(b)) return;
      const x = (padL + i * slot).toFixed(1);
      out.push(`<line class="divider" x1="${x}" x2="${x}" y1="${padT}" y2="${padT + plotH + 4}"/>`);
    });
  }

  // x labels never overlap; collected here and thinned after the loop
  const labels = [];

  bars.forEach((b, i) => {
    const total = b.blast + b.quake;
    const cx = +(padL + i * slot + slot / 2).toFixed(1);
    const x = +(cx - barW / 2).toFixed(1);
    const f = FILTER.bin;
    const picked = f && f.chart === chart && f.key === b.key;
    const dim = f && !picked;
    const g = [`<g class="bar${dim ? ' dim' : ''}" tabindex="0" role="button" ` +
      `data-chart="${chart}" data-key="${b.key}" data-tip="${b.tip}" ` +
      `aria-pressed="${picked ? 'true' : 'false'}" ` +
      `aria-label="${b.tip}. Show only these events.">`];
    // full-height hit area so thin bars stay clickable
    g.push(`<rect class="hit" x="${(cx - slot / 2).toFixed(1)}" y="${padT}" ` +
      `width="${slot.toFixed(1)}" height="${plotH}"/>`);

    // Blasts sit on the baseline, earthquakes stack above. Only the topmost
    // segment gets the rounded end; where they touch, the lower segment
    // gives up GAP px so the surface separates them (never a stroke).
    const base = padT + plotH;
    const hBlast = (b.blast / yMax) * plotH;
    const hQuake = (b.quake / yMax) * plotH;

    if (b.blast) {
      const stacked = b.quake > 0;
      const top = base - hBlast + (stacked ? GAP : 0);
      const h = Math.max(0.5, hBlast - (stacked ? GAP : 0));
      g.push(`<path class="seg" fill="${C_BLAST}" d="${
        stacked ? `M${x} ${top} h${barW} v${h} h${-barW} Z`
                : columnPath(x, top, barW, h, R)}"/>`);
    }
    if (b.quake) {
      const top = base - hBlast - hQuake;
      g.push(`<path class="seg" fill="${C_QUAKE}" ` +
        `d="${columnPath(x, top, barW, hQuake, R)}"/>`);
    }
    if (total) {
      g.push(`<text class="bar-n" x="${cx.toFixed(1)}" ` +
        `y="${(y(total) - 7).toFixed(1)}">${total}</text>`);
    }
    g.push('</g>');
    out.push(g.join(''));

    if (i % tickEvery === 0 && b.label) labels.push({ cx, text: String(b.label) });
  });

  // Thinned right to left, so the regular labels (each January) win over a
  // first, partial period squeezed in front of them.
  let labelLeft = Infinity;
  for (const l of labels.reverse()) {
    const half = l.text.length * 3.2;   // ~6.4 px a character at 10 px
    if (l.cx + half > labelLeft - 6) continue;
    out.push(`<text class="xtick" x="${l.cx.toFixed(1)}" y="${H - 8}">${l.text}</text>`);
    labelLeft = l.cx - half;
  }

  // One direct label, on the tallest column only. Selective labelling is
  // the point — a number over every bar goes unread.
  if (peakLabel) {
    let hi = -1, at = -1;
    bars.forEach((b, i) => { const t = b.blast + b.quake; if (t > hi) { hi = t; at = i; } });
    if (hi > 0) {
      const cx = padL + at * slot + slot / 2;
      const top = y(hi);
      const text = hi === 1 ? t('chart.oneEvent') : t('chart.eventsLabel', { n: hi });
      // keep the label inside the plot rather than letting it overflow
      const half = text.length * 3.4 + 6;
      const lx = Math.min(W - padR - half, Math.max(padL + half, cx));
      out.push(`<line class="peak-tick" x1="${cx.toFixed(1)}" x2="${cx.toFixed(1)}" ` +
        `y1="${(top - 6).toFixed(1)}" y2="${(top - 15).toFixed(1)}"/>`);
      out.push(`<text class="peak-label" x="${lx.toFixed(1)}" ` +
        `y="${(top - 20).toFixed(1)}">${text}</text>`);
    }
  }

  out.push(`<line class="axis" x1="${padL}" x2="${W - padR}" ` +
    `y1="${padT + plotH}" y2="${padT + plotH}"/>`);
  out.push('</svg>');
  host.innerHTML = out.join('');

  // Grow the bars in, but only the first time a chart is built — replaying
  // it on every filter change would turn a quick comparison into a wait.
  if (!host.dataset.drawn) {
    host.dataset.drawn = '1';
    if (!matchMedia('(prefers-reduced-motion: reduce)').matches) {
      host.querySelector('svg')?.classList.add('grow');
    }
  }
}

// ── Binning ────────────────────────────────────────────────────────
function bin(keyOf, keys, labelOf, tipOf) {
  const acc = new Map(keys.map(k => [k, { blast: 0, quake: 0 }]));
  for (const ev of shown) {
    const cell = acc.get(keyOf(ev));
    if (!cell) continue;
    if (ev.event_type === 'earthquake') cell.quake++; else cell.blast++;
  }
  return keys.map(k => {
    const c = acc.get(k);
    return {
      key: String(k), label: labelOf(k), blast: c.blast, quake: c.quake,
      tip: tipOf(k, c.blast + c.quake),
    };
  });
}

const hourLabel = h => (h % 12 === 0 ? 12 : h % 12) + (h < 12 ? 'a' : 'p');

function hourBars() {
  return bin(ev => ev.local.hour, [...Array(24).keys()],
    h => (h % 3 === 0 ? hourLabel(h) : ''),
    (h, n) => `${String(h).padStart(2, '0')}:00–${String((h + 1) % 24).padStart(2, '0')}:00 local · ${plural(n, 'event')}`);
}

function dowBars() {
  return bin(ev => ev.local.weekday, DOW, d => d, (d, n) => `${d} · ${plural(n, 'event')}`);
}

// Month keys always span the WHOLE catalog, so filtering to one site can't
// silently shorten the time axis and make that quarry look busier than it is.
function monthBars() {
  const times = EVENTS.map(ev => new Date(ev.time));
  const first = new Date(Math.min(...times)), last = new Date(Math.max(...times));
  const keys = [];
  const cur = new Date(Date.UTC(first.getUTCFullYear(), first.getUTCMonth(), 1));
  const end = new Date(Date.UTC(last.getUTCFullYear(), last.getUTCMonth(), 1));
  while (cur <= end) {
    keys.push(`${cur.getUTCFullYear()}-${MON[cur.getUTCMonth()]}`);
    cur.setUTCMonth(cur.getUTCMonth() + 1);
  }
  // The axis spans years, so it is labelled by year (at each January and
  // at the first month); the tooltip names the month.
  return bin(ev => ev.local.ym, keys,
    k => (k === keys[0] || k.endsWith('-Jan') ? k.split('-')[0] : ''),
    (k, n) => `${k.split('-')[1]} ${k.split('-')[0]} · ${plural(n, 'event')}`);
}

// Magnitude bins are likewise fixed to the full catalog range.
function magBars() {
  const mags = EVENTS.map(e => e.magnitude).filter(m => m != null);
  const hi = Math.max(1, ...mags);
  const lo = Math.floor(Math.min(0, ...mags) / 0.25) * 0.25;   // ML can be negative
  const keys = [];
  for (let v = lo; v <= hi + 0.25; v += 0.25) keys.push(v.toFixed(2));
  const binOf = m => (Math.floor(m / 0.25) * 0.25).toFixed(2);
  return bin(ev => (ev.magnitude == null ? null : binOf(ev.magnitude)), keys,
    k => (Number(k) % 0.5 === 0 ? Number(k).toFixed(1) : ''),
    (k, n) => `M${Number(k).toFixed(2)}–${(Number(k) + 0.25).toFixed(2)} · ${plural(n, 'event')}`);
}

// ── Tooltip ────────────────────────────────────────────────────────
function moveTip(e, text) {
  if (!tip) {
    tip = document.createElement('div');
    tip.className = 'chart-tip';
    tip.setAttribute('role', 'presentation');
    document.body.appendChild(tip);
  }
  tip.textContent = text;
  tip.hidden = false;
  const r = tip.getBoundingClientRect();
  tip.style.left = Math.min(window.innerWidth - r.width - 8,
    Math.max(8, e.clientX - r.width / 2)) + 'px';
  tip.style.top = (e.clientY - r.height - 12) + 'px';
}
function hideTip() { if (tip) tip.hidden = true; }

// ── Draw / redraw ──────────────────────────────────────────────────
function drawAll() {
  const hour = document.getElementById('chart-hour');
  if (!hour) return;
  shown = chartSubset();

  renderBars(hour, {
    bars: hourBars(), height: hour.clientWidth < 520 ? 210 : 268, chart: 'hour',
    band: { from: 6, to: 19, label: t('chart.workday') }, peakLabel: true,
  });
  renderBars(document.getElementById('chart-dow'),
    { bars: dowBars(), height: 170, chart: 'dow' });
  renderBars(document.getElementById('chart-month'),
    { bars: monthBars(), height: 170, chart: 'month',
      divideAt: b => b.key.endsWith('-Jan') });
  renderBars(document.getElementById('chart-mag'),
    { bars: magBars(), height: 170, chart: 'mag' });

  const note = document.getElementById('chart-scope');
  if (note) {
    const site = FILTER.site &&
      EVENTS.find(e => e.site_id === FILTER.site)?.site_label;
    note.textContent = shown.length === EVENTS.length
      ? t('patterns.sub')
      : t('patterns.showing', {
          n: shown.length,
          site: site ? t('patterns.fromSite', { site }) : '',
        });
  }
}

function wire(root) {
  root.addEventListener('mousemove', e => {
    const bar = e.target.closest('.bar');
    if (bar) moveTip(e, bar.dataset.tip); else hideTip();
  });
  root.addEventListener('mouseleave', hideTip);
  root.addEventListener('click', e => {
    const bar = e.target.closest('.bar');
    if (!bar) return;
    const f = { chart: bar.dataset.chart, key: bar.dataset.key };
    const same = FILTER.bin && FILTER.bin.chart === f.chart && FILTER.bin.key === f.key;
    setFilter('bin', same ? null : f);
    if (!same) {
      document.querySelector('.content')
        .scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  });
  root.addEventListener('keydown', e => {
    if (e.key !== 'Enter' && e.key !== ' ') return;
    const bar = e.target.closest('.bar');
    if (!bar) return;
    e.preventDefault();
    bar.dispatchEvent(new MouseEvent('click', { bubbles: true }));
  });
  // keyboard users never fire mousemove, so mirror the tooltip onto focus
  root.addEventListener('focusin', e => {
    const bar = e.target.closest('.bar');
    if (!bar) return;
    const r = bar.getBoundingClientRect();
    moveTip({ clientX: r.left + r.width / 2, clientY: r.top }, bar.dataset.tip);
  });
  root.addEventListener('focusout', hideTip);
}

(async function initCharts() {
  if (!document.getElementById('chart-hour')) return;
  await filtersReady;

  drawAll();
  // the hero chart lives outside #patterns now, so wire the whole document —
  // every handler is scoped by closest('.bar') anyway
  wire(document.body);
  onFilterChange(drawAll);
  onLangChange(() => { drawAll(); });

  let t;
  window.addEventListener('resize', () => { clearTimeout(t); t = setTimeout(drawAll, 150); });
})();
