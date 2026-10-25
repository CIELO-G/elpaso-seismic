# El Paso Seismic Network — public site

Live site: **https://cielo-g.github.io/elpaso-seismic/**

A read-only public view of the [El Paso quake network]
(https://github.com/CIELO-G/elpaso-quake-network) catalog: confirmed
seismic events (mostly quarry blasts, plus locally recorded earthquakes),
their waveforms, and the station map.

## How it works

There is **no backend**. The monitoring pipeline exports static JSON into
`data/` after each daily run (`scripts/export_public_site.py` in the
pipeline repo) and pushes here; GitHub Pages serves the result. The page
is plain HTML/CSS/JS, no build step and no framework:

| file | what it does |
|---|---|
| `index.html` | the front page: map, background, catalog, charts |
| `event.html` | **one event in depth** — record section, every trace, picks, locator (`event.html#<event_id>`) |
| `assets/site.css` | all styles |
| `assets/i18n.js` | **English/Spanish strings + `t()`** — load FIRST on every page |
| `assets/basemaps.js` | dark / light / satellite backdrop switcher, shared by both maps |
| `assets/places.js` | local landmark gazetteer: turns a coordinate into "4 km W of Fort Bliss" |
| `assets/waveforms.js` | **shared** trace drawing — load before any page showing a waveform |
| `assets/site.js` | front page only: map, event list, detail panel; publishes `window.siteReady` |
| `assets/event-page.js` | event.html only: record section, picks table, S−P working, locator |
| `assets/filters.js` | the shared catalog + filter state (site / chart bar / search) |
| `assets/clusters.js` | groups blasts into quarry sites, draws the rings |
| `assets/charts.js` | the four activity histograms |
| `assets/waves.js` | makes each waveform explorable — cursor, phase windows, explainer |
| `tools/validate_palette.py` | checks data colours against a surface; not shipped to the site |

### Colour rules

**Light page, dark instruments.** The page is light and open; the two
things that are *readouts* — the map band at the top and the waveform
canvases — stay black, so they read as instrument panels set into the page.
That contrast is the look. The map band keeps its black frame and
caption whichever backdrop is behind it.

Two tokens in `assets/site.css` are **data**, not decoration:

| token | hex | meaning | on dark map | on light page |
|---|---|---|---|---|
| `--blast` | `#04a14a` | quarry blast (emerald) | 5.58:1 | 3.12:1 |
| `--quake` | `#e307dc` | earthquake (magenta) | 4.79:1 | 3.63:1 |

They are stepped to clear 3:1 on **both** surfaces, so an event is the same
colour wherever it appears — the map, the charts, the list swatches.
Separation: normal ΔE 45.9, protan 31.5, deutan 20.1 (target 8). Check both:

    python tools/validate_palette.py "#04a14a,#e307dc" --surface "#0c0c0c"
    python tools/validate_palette.py "#04a14a,#e307dc" --mode light --surface "#f5f6f4"

A colour that passes on one surface can fail on the other — the earlier
emerald `#17a750` cleared the dark map at 4.79:1 but came in at 2.90:1 on
the light page, under the 3:1 floor. Always run both.

`--accent` (`#0e7a3c`) is UI chrome only — links, focus rings, active
states, chips. Text never wears a data colour; identity comes from a swatch
*beside* the text, which is why an event row has a dot rather than a
coloured magnitude.

Quarry rings use `--ring`, a **neutral** — a ring is an annotation, and a
coloured one could be mistaken for an event. Identity is the letter on the
ring, not a hue: all five rings are on screen at once, and five categorical
colours cannot clear the all-pairs separation gates. Selecting a site dims
the others — emphasis, not a rainbow.

Phase colours on the waveform canvases (`--p-wave`, `--s-wave`, `--rg-wave`)
are tuned for **black**; the explainer panel sits on the light page and uses
darker steps of the same hues.

### Map marker contrast — validate the COMPOSITE, not the swatch

A circle drawn at partial fill opacity is not its hex; it is that hex
composited onto whatever is behind it. The markers originally used
`fillOpacity: 0.55`, and measured:

| | pure hex | at 55% fill |
|---|---|---|
| blast on dark map | 5.78:1 | **2.47:1** |
| blast on light map | 3.04:1 | **1.85:1** |
| quake on dark map | 4.96:1 | **2.13:1** |

All under the 3:1 floor, on every backdrop, even though the hexes pass.
This was missed because the validator was run on the swatch. **When a mark
is drawn at <100% opacity, composite it against its background first.**

Current approach (`MARKER_THEME` in `assets/basemaps.js`):

- Near-opaque fills (0.90–0.92), so what renders is close to the hex.
- A **darker emerald step `#049143` on the light backdrop** — `#04a14a`
  cannot clear 3:1 against near-white at any opacity.
- A stroke that contrasts with the *backdrop*, not the fill.

**Satellite is the case no flat colour solves.** Against imagery the same
green measures 1.65:1 on desert, 3.14:1 on vegetation and 2.10:1 on bright
sand — there is no single value that works, because the backdrop is not one
value. The marker is therefore defined by its **outline**: a white stroke
plus a dark drop-shadow, with the fill carrying identity only.

`markerStyle()` is the single source of truth — marker creation and the
filter-dimming pass both call it, so they cannot drift apart, and switching
backdrop re-runs `applyFilters()` to restyle everything.

### Active and retired stations

`data/stations.json` has **no status field**, and adding one here would not
survive — `data/` is overwritten wholesale by every pipeline export. So
status is derived in `site.js` from the **network code**, which is stable:

| network | what it is | status |
|---|---|---|
| `AM` | Raspberry Shake community sensors | standing |
| `EP` | KIDD, the UTEP broadband station | standing |
| `4B` | Fairfield ZLand nodal deployment | recovered, June 2021 |

The 49 nodes ran for four days in June 2021 and were pulled out of the
ground afterwards. They still belong on the map, because the 2021 events
in the catalog were located with them — but they are **off by default**:
at city scale they sit almost on top of one another and bury the 14
standing stations under a grey smear. The switcher under the basemap
control offers Active / Retired / Both, and the choice is kept in
`localStorage`.

`RETIRED_STATIONS` in `site.js` is the escape hatch for a single box that
bucks its network — add the station code and nothing else has to change.

Two consequences worth knowing. The HUD counts **active** stations, not
`meta.n_stations`, which is 63 and would contradict what the map shows.
And `event.html` is unaffected: its locator only ever draws the stations
that recorded *that* event, so 2021 events still show their nodes.

### Layout notes

The map is the first thing on the page and is a **sibling of `<main>`, not a
child**. It used to break out of the centred container with
`width: 100vw; margin-left: calc(50% - 50vw)`, but `100vw` counts the
scrollbar while the layout viewport does not, so that overflowed
horizontally by exactly the scrollbar width on narrow screens. Keeping it
outside the container avoids the vw maths entirely.

The map height is budgeted (`clamp(350px, 46vh, 545px)`) so the headline and
the hero figure are still visible without scrolling on a 900px-tall
viewport. If you make the map taller, check that first screen again.

### Language

The site is bilingual because El Paso and Ciudad Juárez are one metro and
a good share of the blasts are on the Juárez side — Sites A and B both
resolve to Juárez landmarks.

- **Static copy**: `<p data-i18n="some.key">fallback</p>`. `applyI18n()`
  fills it; values may contain `<b>`, `<i>` and `<code>`.
- **Attributes**: `data-i18n-attr="placeholder:catalog.search"`.
- **Generated copy**: `t('key', { n: 5 })`, substituting `{n}`.
- **Anything built in JS must re-render on `onLangChange()`** — that is the
  easy thing to forget, and it shows up as one stubbornly English sentence
  in an otherwise Spanish page.

`i18n.js` calls `applyI18n()` and `wireLangToggle()` itself at load, so a
page cannot forget to translate itself and a Spanish-preferring browser
never sees an English flash. The choice is kept in `localStorage`.

Spanish is Mexican Spanish: **sismo** not *terremoto* (nothing here is
destructive), **voladura** for the blast, **cantera** for the quarry, and
the compass uses **O** for *oeste*, not W.

### Places, not coordinates

`assets/places.js` is a hand-written list of El Paso / Juárez / southern
New Mexico landmarks. `describePlace(lat, lon)` returns "8 km WNW of
Zaragoza, Juárez". It is **reference geography, not event data** — `data/`
stays untouched — and it uses no geocoding service, because the site takes
no API keys. All 42 events currently resolve to a usable label. Add a place
by pushing a row.

### Adding another page

`event.html` is the pattern. Pages are **flat files at the repo root**, not
in subfolders: every path in the code is relative (`assets/…`, `data/…`),
so a sibling file works unchanged while a subfolder would break every
fetch. Each page loads only the scripts it needs — `event.html` does not
load `site.js`, because `site.js` builds the catalog map unconditionally
and would throw on a page with no `#map`.

The header and footer are duplicated per page on purpose: there is no build
step to template them, and injecting them with JS would flash and break
without JS. Fine at three or four pages; revisit past about eight.

**Load order matters.** `site.js` defines `map`, `markers` and `catalog`;
`filters.js` waits on `window.siteReady` and owns the filter state;
`clusters.js` stamps site membership onto the catalog *before*
`charts.js` first draws. They are classic scripts sharing globals, so a
top-level name declared twice across two of them is a fatal error — keep
new names unique.

- `data/meta.json` — counts + generation timestamp
- `data/catalog.json` — all confirmed events (list)
- `data/events/<id>.json` — one event: picks + decimated waveforms
- `data/stations.json` — station coordinates

The full schema is documented in [DATA.md](DATA.md). Treat `data/` as
read-only: it is overwritten by every pipeline export. **Site code and
site data are decoupled** — you can redesign everything under `assets/`
and `index.html` without touching the pipeline.

## Developing locally

Any static file server works:

    python3 -m http.server 8080
    # -> http://localhost:8080

### Base maps

Two backdrops, switchable on either map (`assets/basemaps.js`):

| backdrop | source | kind |
|---|---|---|
| Street (default) | OpenFreeMap `positron` | maplibre vector |
| Satellite | Esri World Imagery | raster tiles |

There was a third, OpenFreeMap `dark`, and it was the default. It was
dropped because the two backdrops people actually reach for are a street
map to find a place and imagery to see the ground. Anything still holding
`dark` or `light` in `localStorage` is mapped onto `street` by
`LEGACY_BASEMAP` rather than silently falling through to the default —
the branch is there so the reason is visible.

**Keyless only — do NOT add API-keyed tile providers.** This is a public
repo and a public site, so a key here is a key published. That rules out
Mapbox, MapTiler, Google and Bing imagery.

Esri World Imagery was chosen over the USGS National Map because it covers
**both sides of the border**. Two of the five quarry clusters are in
Juárez, and a US-only imagery source thins out exactly where half the data
is. Esri requires attribution, which the layer carries.

Note the two layer kinds: dark and light are *vector* styles rendered
through the maplibre GL bridge, satellite is plain *raster* tiles. Anything
that touches the layer must not assume one or the other.

Per-backdrop colours live in `site.css`, keyed off `data-basemap` on the
frame — including the Leaflet SVG paths, because CSS beats the
presentation attributes Leaflet writes inline. This matters: the pale grey
station triangles and quarry rings are invisible on the light backdrop and
need a dark halo on imagery.

## Roadmap (student project)

Built:

- [x] Time-of-day + day-of-week histograms. Binned in `America/Denver`,
      not UTC — with real DST applied, **35 of 98 blasts** land in the
      17:00 hour and 97% fall inside the work day. A fixed −6 offset
      smears that peak across two bars and understates it by half.
- [x] Magnitude and events-per-month charts.
- [x] Per-quarry event clusters — single-link at 3 km, blasts only.
- [x] Filter/search. The three filters (site, chart bar, text) intersect
      rather than replace each other, and the histograms redraw for the
      selected quarry.
- [x] Mobile layout + accessibility pass: keyboard-operable event rows and
      chart bars, visible focus rings, a skip link, and an `aria-live`
      result count.
- [x] "Felt something?" FAQ linking USGS Did-You-Feel-It.
- [x] Move-out guides drawn over the waveforms (P and S).
- [x] Interactive waveforms. Hover or arrow along any trace and it names
      the part of the wave you are on (noise / P / S / coda) and
      shades that window; click for a full explanation with this trace's
      own numbers. Boundaries come from the event's **picks** where they
      exist and fall back to predicted arrivals otherwise — the panel says
      which, because a predicted arrival is not a measurement.

Turned off for now:

- [ ] **Rg, everywhere.** Switched off at the request of the project, not
      removed from the logic. `SHOW_RG` at the top of `assets/site.js` is the
      single switch: set it back to `true` and the Rg move-out guide returns,
      and the wave explainer starts naming the Rg window again (`waves.js`
      reads the same flag). The prose **section** was deleted from
      `index.html` and would have to be written back in, along with its nav
      link and the FAQ sentence that pointed at it.
      With Rg off, the S window runs until twice the S travel time — the
      usual convention for where a coda window starts.

Still open:

- [ ] **Rg spectra.** Deliberately not built, and moot while Rg is off. `events/<id>.json` ships
      decimated min/max *envelopes* (700 bins, normalised to ±1), and an
      envelope has no phase information, so a Fourier transform of it
      describes the envelope rather than the ground motion. Real spectra
      need a new field out of `export_public_site.py` in the pipeline
      repo — a spectrum, or raw samples. The site does not reach past
      `data/`, so this cannot be fixed here.
- [ ] Cluster labels are `Site A`…`Site E`, positioned relative to
      downtown. Nothing in `data/` identifies a quarry operator, so the
      page does not name one.
- [ ] Depth is exported but unused; some values are negative (above
      datum) and would need a caveat before being charted.

Work on a fork / feature branches with PRs, please.
