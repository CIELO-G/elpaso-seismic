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
is plain HTML/CSS/JS — `index.html`, `assets/site.css`, `assets/site.js`.

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

Basemap tiles come from OpenFreeMap (keyless — do NOT add API-keyed tile
providers here; this is a public repo and a public site).

## Ideas / roadmap (student project)

- Time-of-day + day-of-week histograms (blasts peak ~17:00 local!)
- Magnitude–frequency and events-over-time charts
- Per-quarry event clusters; "what is Rg?" explainer with the spectra
- Filter/search, mobile layout, accessibility pass
- A "felt something?" FAQ linking USGS Did-You-Feel-It

Work on a fork / feature branches with PRs, please.
