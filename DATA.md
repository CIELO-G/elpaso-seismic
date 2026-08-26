# Data schema (`data/`)

Written by `scripts/export_public_site.py` in the pipeline repo. All
times are UTC ISO-8601. Only **confirmed** events are exported.

## `meta.json`

```json
{
  "generated_utc": "2026-08-28T15:00:00+00:00",
  "n_events": 42, "n_quarry_blasts": 41, "n_earthquakes": 1,
  "n_stations": 14
}
```

## `catalog.json` — array, newest first

| field | type | notes |
|---|---|---|
| `event_id` | string | stable id, e.g. `ep20251122-0001` |
| `time` | string | origin time UTC |
| `latitude`, `longitude` | number | degrees |
| `depth_km` | number\|null | poorly resolved for shallow blasts |
| `magnitude` | number\|null | local magnitude ML |
| `event_type` | string | `quarry_blast` \| `earthquake` |
| `num_picks` | int | phase picks used |

## `events/<event_id>.json`

Everything from the catalog row, plus:

- `picks`: `[{station, phase: "P"|"S", t}]` — `t` = seconds after origin
- `traces`: array sorted by distance, one per station:

| field | type | notes |
|---|---|---|
| `station`, `network` | string | |
| `distance_km` | number | epicentral distance |
| `t0` | number | trace start, seconds relative to origin (−2.0) |
| `dt` | number | seconds per bin |
| `minmax` | `[[min,max],…]` | 700 bins, amplitudes normalized to ±1 |

To draw a trace: bin `i` spans time `t0 + i*dt`; fill between `min` and
`max`. Overlay picks at `t` on the same axis (see `drawTrace` in
`assets/site.js`).

## `stations.json`

`[{station, network, latitude, longitude, model}]` — station coordinates
are already public via Raspberry Shake / EarthScope.
