/* El Paso Seismic Network — local landmarks.
 *
 * "31.684, −106.429" tells a local nothing. This turns a coordinate into
 * "4 km SW of Socorro", which is how people here actually describe where
 * something is.
 *
 * This is REFERENCE GEOGRAPHY, not event data — it is hand-written here
 * rather than exported from the pipeline, and data/ stays untouched. The
 * coordinates are approximate town/landmark centres, good to a kilometre
 * or so, which is all a "N km DIR of X" label needs. No geocoding service
 * is used: the site takes no API keys.
 *
 * Adding a place: push a row. Nothing else needs to change.
 */

const PLACES = [
  // — El Paso, Texas
  { name: 'downtown El Paso',  es: 'el centro de El Paso', lat: 31.7587, lon: -106.4869 },
  { name: 'UTEP',              es: 'UTEP',                 lat: 31.7688, lon: -106.5050 },
  { name: 'Fort Bliss',        es: 'Fort Bliss',           lat: 31.8130, lon: -106.4210 },
  { name: 'the airport',       es: 'el aeropuerto',        lat: 31.8072, lon: -106.3781 },
  { name: 'Ysleta',            es: 'Ysleta',               lat: 31.6968, lon: -106.3230 },
  { name: 'Socorro',           es: 'Socorro',              lat: 31.6537, lon: -106.3033 },
  { name: 'Horizon City',      es: 'Horizon City',         lat: 31.6543, lon: -106.1783 },
  { name: 'Fabens',            es: 'Fabens',               lat: 31.5026, lon: -106.1583 },
  { name: 'Canutillo',         es: 'Canutillo',            lat: 31.9179, lon: -106.5936 },
  { name: 'Vinton',            es: 'Vinton',               lat: 31.9459, lon: -106.5989 },
  { name: 'Anthony',           es: 'Anthony',              lat: 32.0043, lon: -106.6036 },

  // — the Franklins
  { name: 'the Franklin Mountains', es: 'las Montañas Franklin',
    lat: 31.8930, lon: -106.4950 },

  // — New Mexico
  { name: 'Sunland Park',   es: 'Sunland Park',   lat: 31.7973, lon: -106.5794 },
  { name: 'Santa Teresa',   es: 'Santa Teresa',   lat: 31.8434, lon: -106.6383 },
  { name: 'Chaparral',      es: 'Chaparral',      lat: 32.0426, lon: -106.4000 },
  { name: 'Las Cruces',     es: 'Las Cruces',     lat: 32.3199, lon: -106.7637 },

  // — Ciudad Juárez, Chihuahua
  { name: 'central Ciudad Juárez', es: 'el centro de Ciudad Juárez',
    lat: 31.7394, lon: -106.4869 },
  { name: 'Zaragoza, Juárez',      es: 'Zaragoza, Juárez',
    lat: 31.6667, lon: -106.3500 },
];

const PLACE_NEAR_KM = 2.5;      // inside this, say "near X" rather than a bearing

function placeDistKm(lat, lon, p) {
  const dy = (lat - p.lat) * 111.0;
  const dx = (lon - p.lon) * 111.0 * Math.cos((lat + p.lat) / 2 * Math.PI / 180);
  return Math.hypot(dx, dy);
}

/* Nearest landmark, phrased in the current language. Returns '' if nothing
 * is close enough to be useful — better silence than "87 km NNW of Fabens". */
function describePlace(lat, lon, maxKm = 40) {
  if (!PLACES.length) return '';
  let best = null;
  for (const p of PLACES) {
    const km = placeDistKm(lat, lon, p);
    if (!best || km < best.km) best = { p, km };
  }
  if (!best || best.km > maxKm) return '';

  const name = (typeof LANG !== 'undefined' && LANG === 'es' && best.p.es)
    ? best.p.es : best.p.name;

  if (best.km < PLACE_NEAR_KM) return t('place.near', { place: name });

  const dy = (lat - best.p.lat) * 111.0;
  const dx = (lon - best.p.lon) * 111.0 * Math.cos(lat * Math.PI / 180);
  const deg = (Math.atan2(dx, dy) * 180 / Math.PI + 360) % 360;
  const dir = compassPoints()[Math.round(deg / 22.5) % 16];

  return t('place.of', { km: best.km.toFixed(0), dir, place: name });
}
