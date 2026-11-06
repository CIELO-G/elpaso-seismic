/* El Paso Seismic Network — English / Spanish.
 *
 * El Paso and Ciudad Juárez are one bilingual metro, and a good share of
 * the blasts in this catalog are on the Juárez side. An English-only page
 * about events in Juárez is talking past a lot of the people it is for.
 *
 * HOW IT WORKS
 *   Static copy: mark it up as <p data-i18n="key">…</p> and applyI18n()
 *   fills it in. For an attribute, use data-i18n-attr="placeholder:key".
 *   Generated copy: call t('key', { n: 5 }) — {n} is substituted.
 *
 * Load this FIRST, before any script that calls t().
 *
 * TRANSLATION NOTES: Mexican Spanish, since that is the local variety.
 * "sismo" rather than "terremoto" (a terremoto is a big destructive one —
 * nothing in this catalog qualifies). "voladura" is the blast itself,
 * "cantera" the quarry. Phases keep their letters: onda P, onda S.
 */

const LANGS = ['en', 'es'];
const I18N_KEY = 'eps-lang';

const STRINGS = {
  en: {
    // ── chrome
    'brand.name': 'El Paso Seismic Network',
    'brand.sub': 'UTEP · CIELO-G',
    'nav.felt': 'Felt shaking?',
    'nav.back': '← All events',
    'nav.backCatalog': '← Back to all events',
    'lang.toggle': 'Español',
    'lang.label': 'Cambiar a español',
    'theme.toDark': 'Dark',
    'theme.toLight': 'Light',
    'theme.label': 'Switch between a white and a black background',
    'skip.list': 'Skip to the event list',
    'skip.record': 'Skip to the record section',
    'about.partner': 'Built in partnership with CIELO-G',
    'foot.pipeline': 'Processing code',
    'foot.site': 'Website code',

    // ── map band
    'hud.events': 'confirmed events',
    'hud.blasts': 'quarry blasts',
    'hud.quakes': 'earthquakes',
    'hud.stations': 'stations',
    'legend.blast': 'Quarry blast',
    'legend.quake': 'Earthquake',
    'legend.station': 'Station',
    'legend.retired': 'Retired',
    'legend.cluster': 'Quarry',
    'map.caption': 'Larger circles are larger events. Dashed rings mark quarries that blast again and again. Click any event for details.',
    'basemap.label': 'Base map',
    'basemap.street': 'Street',
    'basemap.satellite': 'Satellite',
    'sta.label': 'Stations',
    'sta.active': 'Active',
    'sta.retired': 'Retired',
    'sta.both': 'Both',
    'sta.activeNote': 'active station',
    'sta.retiredNote': 'retired · 2021 nodal deployment',
    'map.fullscreen': 'View map full screen',
    'map.exitFullscreen': 'Exit full screen',

    // ── freshness
    'fresh.recent': 'Latest confirmed event: {date}.',
    'fresh.lag': 'New events usually take a few weeks to appear, because a person reviews each one first.',
    'fresh.updated': 'Last updated {date}',
    'fresh.refreshed': 'Updated {ago}.',

    // ── story
    'chart.when': 'Time of day',
    'chart.whenSub': 'Events per hour, El Paso local time',
    'chart.selectBar': 'Click a bar to show only that hour on the map and in the list.',
    'chart.workday': 'work day',

    // ── what to expect
    'expect.when': 'Most blasts happen on weekday afternoons, most often around <b>{hour}</b>.',
    'expect.gap': 'There are usually about {gap} days between one event and the next.',
    'expect.sunday': 'Sundays are almost always quiet: {sun} of {total} blasts.',
    'expect.caveat': 'These are patterns in what we have recorded, not a published blasting schedule.',

    // ── catalog
    'catalog.h2': 'Events',
    'catalog.search': 'Search by date, place or type',
    'catalog.searchLabel': 'Search events',
    'catalog.empty': 'No events match those filters.',
    'catalog.showing': 'Showing all {n} events.',
    'catalog.matching': '{n} events match the current filters.',
    'catalog.clearAll': 'Clear all',
    'catalog.nEvents': '{n} events',
    'catalog.oneEvent': '1 event',
    'detail.select': 'Event details',
    'detail.hint': 'Choose an event on the map or in the list to see where it was and the seismograms each station recorded.',
    'detail.more': 'Full event page',
    'detail.guides': 'Show P / S move-out guides',
    'detail.waveHint': 'Move along a trace to see which part of the wave you are looking at. Click for an explanation.',
    'type.blast': 'Quarry blast',
    'type.quake': 'Earthquake',
    'detail.picks': 'picks',
    'detail.stations': 'stations',

    // ── quarries
    'sites.h2': 'Where the blasts come from',
    'sites.lead': '{inSites} of {total} blasts come from {n} small areas a few kilometres across. These are working quarries. {top} alone accounts for {topN}.',
    'sites.note': 'Blasts within 3 km of each other are grouped as one site. The groups come from our data alone; we have not matched them to quarry operators. Click a site to show only its blasts.',
    'sites.site': 'Site {letter}',
    'sites.blasts': 'blasts',
    'sites.blast': 'blast',
    'sites.usually': 'usually {hour}',

    // ── charts
    'patterns.h2': 'More from the catalog',
    'patterns.sub': 'These charts follow the filters above: pick a site, an hour or a search and they update.',
    'patterns.showing': 'Showing {n} events{site}.',
    'patterns.fromSite': ' from {site}',
    'chart.dow': 'Day of week',
    'chart.month': 'Events per month',
    'chart.mag': 'Magnitude',
    'chart.eventsLabel': '{n} events',
    'chart.oneEvent': '1 event',

    // ── felt / DYFI
    'felt.h2': 'Felt shaking?',
    'felt.bannerBody': 'If you felt the ground shake, please fill in the USGS “Did You Feel It?” form. It takes about a minute. There are few seismometers in this region, so reports from residents fill in what the instruments miss.',
    'felt.bannerCta': 'Report it to the USGS',
    'felt.bannerNote': 'Opens earthquake.usgs.gov. This network is a university research project, not a warning or emergency service. In an emergency, call 911.',
    'faq.q1': 'I felt a jolt in the afternoon. Was it an earthquake?',
    'faq.a1': 'Probably not. Almost every event we have recorded is a quarry blast, and most of them happen on weekday afternoons. If it was a blast, it should appear in the list within a few weeks.',
    'faq.q2': 'How can I tell a blast from an earthquake?',
    'faq.a2': 'A blast usually comes as one sharp bang or thud. You may hear a boom through the air a second or two after the ground moves, because sound travels much more slowly than shaking through rock. Blasts happen during working hours and come from the same few places. An earthquake can happen at any time and almost anywhere.',
    'faq.q3': 'Can quarry blasting damage my home?',
    'faq.a3': 'The events we record are small (see the magnitude chart above). If you are worried about blasting near your home, contact the quarry operator or the state agency that regulates mining. We can tell you when events happened, but we cannot assess damage.',
    'faq.q4': 'Why is nothing from the last few weeks listed?',
    'faq.a4': 'A person checks every event before it goes on this page, so there is a delay. A quiet recent stretch usually means we have not reviewed it yet, not that nothing happened.',

    // ── about

    // ── wave explainer
    'wave.noise.title': 'Before the event: background noise',
    'wave.noise.body': 'The ground is never still. Wind, traffic, machinery and even distant ocean swell keep it trembling at this level all day. Every detection the network makes has to stand out from this baseline, which is why small events are only found close to a station.',
    'wave.p.title': 'P wave: the first arrival',
    'wave.p.body': 'A compressional wave: it squeezes and stretches the rock along its own direction of travel, exactly like sound moving through air. It is the fastest thing the source releases, roughly 6 km/s through this crust, so it always arrives first. It is often small; the strong shaking usually comes later.',
    'wave.s.title': 'S wave: the second arrival',
    'wave.s.body': 'A shear wave: it moves the rock sideways, across its direction of travel, like a flick down a rope. It travels at roughly 3.5 km/s, so it falls steadily further behind P the further it goes, which is why the gap between the two tells you the distance. S is normally much larger than P, and it cannot pass through liquid.',
    'wave.coda.title': 'Coda: the decaying tail',
    'wave.coda.body': 'Energy that has bounced off cracks, layers and buried topography on its way here, arriving late and from every direction at once. How slowly the coda dies away is itself a measurement: it describes how broken up the rock along the path is.',
    'wave.region.noise': 'background noise',
    'wave.region.p': 'P wave',
    'wave.region.s': 'S wave',
    'wave.region.coda': 'coda',
    'wave.fact.arrival': '{kind} arrival {t} after the event, {d} km out',
    'wave.fact.picked': 'Picked',
    'wave.fact.predicted': 'Predicted',
    'wave.fact.sp': 'S trails P by {sp} s here, and that gap widens with distance, which is how one station alone can estimate range',
    'wave.fact.spClose': 'The standard S−P rule gives about {est} km, close to the located {real} km',
    'wave.fact.spOff': 'The standard S−P rule gives about {est} km against a located {real} km. The rule assumes a deep crustal path; for a station this close the waves stay in slower shallow rock, so it overshoots',
    'wave.close': 'Close explanation',

    // ── event page
    'event.record': 'The record section',
    'event.recordSub': 'Every station that recorded this event, stacked by how far away it is. Time runs left to right from the moment the event happened.',
    'event.pMoveout': 'P move-out ({v} km/s)',
    'event.sMoveout': 'S move-out ({v} km/s)',
    'event.pick': 'Analyst pick',
    'event.byStation': 'Station by station',
    'event.byStationSub': 'Hover or arrow along any trace to see what part of the wave you are on. Click it for the explanation.',
    'event.picksH2': 'Phase picks',
    'event.picksSub': 'The arrival times an analyst marked, in seconds after the event. These are what the location was computed from.',
    'event.where': 'Where it was',
    'event.whereSub': 'The event and the {n} stations that recorded it. Dashed lines are the paths the waves travelled.',
    'event.notFound': 'Event not found',
    'event.noId': 'No event was specified. Pick one from the catalog on the map page.',
    'event.badId': 'No event with the id “{id}” is in this catalog.',
    'event.magnitude': 'Magnitude',
    'event.location': 'Location',
    'event.stations': 'Stations',
    'event.phasePicks': 'Phase picks',
    'event.nearest': 'Nearest station',
    'event.furthest': 'Furthest station',
    'event.thStation': 'Station',
    'event.thPhase': 'Phase',
    'event.thArrival': 'Arrival',
    'event.thDistance': 'Distance',
    'event.thEstimated': 'Estimated',
    'event.thLocated': 'Located',
    'event.spH3': 'What the S−P gap alone would tell you',
    'event.spBody': 'S always trails P, and the gap grows with distance. One station’s gap estimates its own range: <code>distance ≈ (S−P) × {k}</code> km. That constant is fitted to this catalog’s own picks rather than taken from a textbook. The textbook value is out by about 67% on these paths.',
    'event.spNote': 'The rule assumes a deep crustal path. For a station close to the event the waves stay in slower, shallow rock, so the estimate overshoots, which is exactly why a real location uses every station at once instead of one rule of thumb.',
    'event.spClose': 'close',
    'event.noWaves': 'No waveforms were archived for this event, so there is no record section to draw. Its picks are listed below.',
    'event.recordNoteFew': 'Only {n} station recorded this event, so there is little move-out to see. Events recorded by four or more stations show the fan much better.',
    'event.recordNote': '{n} stations spanning {km} km. The further up the plot, the further the station, and the wider the gap between the P and S dots, because S loses ground the whole way.',
    'event.depthNote': 'Reported depth {d} km. Depth is the least well resolved number in a shallow local catalog: a majority of events here solve to a depth above the reference datum, which is why it is reported but not plotted.',
    'event.localTime': 'local time',

    // ── places
    'place.of': '{km} km {dir} of {place}',
    'place.near': 'near {place}',
    'nav.events': 'Events',
    'nav.blasts': 'Blasts & earthquakes',
    'nav.about': 'About',
    'foot.name': 'El Paso Seismic Network · The University of Texas at El Paso',
    'hud.quake': 'earthquake',
    'intro.h1': 'Earthquakes and quarry blasts in El Paso and Ciudad Juárez',
    'intro.lead': 'The El Paso Seismic Network is a student-run project at The University of Texas at El Paso (UTEP). Community <b>Raspberry Shake</b> seismometers in El Paso and Ciudad Juárez, together with UTEP’s broadband station <b>KIDD</b>, record ground motion around the clock, and we list every event we confirm here. Most are blasts at local quarries.',
    'feltCard.h': 'Felt shaking just now?',
    'feltCard.body': 'Tell the U.S. Geological Survey. Reports from people who felt it help work out what happened, and it takes about a minute.',
    'feltCard.note': 'This site is not updated in real time and is not an emergency service. In an emergency, call 911.',
    'catalog.sub': 'Newest first, in El Paso local time.',
    'blasts.h2': 'Quarry blasts and earthquakes',
    'blasts.p1': 'Several quarries around the Franklin Mountains and in Juárez use explosives to break up rock. Each blast shakes the ground enough for our stations to record it, and people nearby often feel or hear it. Almost every event in our catalog is one of these blasts.',
    'blasts.p2': 'Blasts and earthquakes can be told apart. A blast happens at the surface, during working hours, and comes from the same few places. An earthquake starts underground, can happen at any hour, and usually happens somewhere new. We check every event and label it one or the other before it goes on this page.',
    'expect.h3': 'What our records show so far',
    'about.p2': 'Earthquakes are rare here, so there is little local record of them. We are building that record now. It gives us a baseline to compare against, and if a larger earthquake ever happens, the instruments will already be in place.',
    'about.howH': 'How an event gets on this page',
    'about.step1': 'Each station records ground motion continuously, and we collect the data every night.',
    'about.step2': 'Machine-learning models (PhaseNet and PhaseNO) mark where seismic waves arrive at each station.',
    'about.step3': 'Arrivals seen at several stations at once are grouped into an event and located (GaMMA, NonLinLoc).',
    'about.step4': 'A person reviews the event, labels it a quarry blast or an earthquake, and only then publishes it here.',
    'about.dataH': 'Data and code',
    'about.data': 'The catalog is public. You can download it as <a href="data/catalog.json">JSON</a>, read the <a href="https://github.com/CIELO-G/elpaso-seismic/blob/main/DATA.md">description of the data</a>, or look at the <a href="https://github.com/CIELO-G/elpaso-quake-network">processing code</a> and <a href="https://github.com/CIELO-G/elpaso-seismic">website code</a> on GitHub.',
    'nav.how': 'How it works',
    'about.funding': 'The network is part of <a href="https://www.cielog.org/">CIELO-G</a> (Community-driven Inclusive Excellence and Leadership Opportunities in the Geosciences), funded by the U.S. National Science Foundation under <a href="https://www.nsf.gov/awardsearch/show-award/?AWD_ID=2228180">Award No. 2228180</a>. CIELO-G brings together students, researchers, local educators and community organizations to work on geoscience questions in the Paso del Norte region, including earthquake hazards in West Texas and southern New Mexico.',
    'about.award': 'Funded by NSF Award No. 2228180',
    'about.disclaimer': 'This material is based upon work supported by the National Science Foundation under Award No. 2228180. Any opinions, findings, and conclusions or recommendations expressed here are those of the authors and do not necessarily reflect the views of the National Science Foundation.',

  },

  es: {
    // ── chrome
    'brand.name': 'Red Sísmica de El Paso',
    'brand.sub': 'UTEP · CIELO-G',
    'nav.felt': '¿Sentiste algo?',
    'nav.back': '← Todos los eventos',
    'nav.backCatalog': '← Volver a todos los eventos',
    'lang.toggle': 'English',
    'lang.label': 'Switch to English',
    'theme.toDark': 'Oscuro',
    'theme.toLight': 'Claro',
    'theme.label': 'Cambiar entre fondo blanco y fondo negro',
    'skip.list': 'Ir a la lista de eventos',
    'skip.record': 'Ir a la sección de registro',
    'about.partner': 'Hecho en colaboración con CIELO-G',
    'foot.pipeline': 'Código de procesamiento',
    'foot.site': 'Código del sitio',

    // ── map band
    'hud.events': 'eventos confirmados',
    'hud.blasts': 'voladuras de cantera',
    'hud.quakes': 'sismos',
    'hud.stations': 'estaciones',
    'legend.blast': 'Voladura de cantera',
    'legend.quake': 'Sismo',
    'legend.station': 'Estación',
    'legend.retired': 'Retirada',
    'legend.cluster': 'Cantera',
    'map.caption': 'Los círculos más grandes son eventos más grandes. Los anillos punteados marcan canteras con voladuras repetidas. Haz clic en cualquier evento para ver los detalles.',
    'basemap.label': 'Mapa base',
    'basemap.street': 'Calles',
    'basemap.satellite': 'Satélite',
    'sta.label': 'Estaciones',
    'sta.active': 'Activas',
    'sta.retired': 'Retiradas',
    'sta.both': 'Ambas',
    'sta.activeNote': 'estación activa',
    'sta.retiredNote': 'retirada · despliegue nodal de 2021',
    'map.fullscreen': 'Ver el mapa en pantalla completa',
    'map.exitFullscreen': 'Salir de pantalla completa',

    // ── freshness
    'fresh.recent': 'Último evento confirmado: {date}.',
    'fresh.lag': 'Los eventos nuevos suelen tardar unas semanas en aparecer, porque una persona revisa cada uno antes.',
    'fresh.updated': 'Actualizado el {date}',
    'fresh.refreshed': 'Actualizado {ago}.',

    // ── story
    'chart.when': 'Hora del día',
    'chart.whenSub': 'Eventos por hora, hora local de El Paso',
    'chart.selectBar': 'Haz clic en una barra para ver solo esa hora en el mapa y en la lista.',
    'chart.workday': 'jornada laboral',

    // ── what to expect
    'expect.when': 'La mayoría de las voladuras ocurre entre semana por la tarde, sobre todo alrededor de las <b>{hour}</b>.',
    'expect.gap': 'Normalmente pasan unos {gap} días entre un evento y el siguiente.',
    'expect.sunday': 'Los domingos casi siempre están tranquilos: {sun} de {total} voladuras.',
    'expect.caveat': 'Son patrones en lo que hemos registrado, no un calendario oficial de voladuras.',

    // ── catalog
    'catalog.h2': 'Eventos',
    'catalog.search': 'Busca por fecha, lugar o tipo',
    'catalog.searchLabel': 'Buscar eventos',
    'catalog.empty': 'Ningún evento coincide con esos filtros.',
    'catalog.showing': 'Mostrando los {n} eventos.',
    'catalog.matching': '{n} eventos coinciden con los filtros actuales.',
    'catalog.clearAll': 'Quitar todo',
    'catalog.nEvents': '{n} eventos',
    'catalog.oneEvent': '1 evento',
    'detail.select': 'Detalles del evento',
    'detail.hint': 'Elige un evento en el mapa o en la lista para ver dónde ocurrió y los sismogramas que registró cada estación.',
    'detail.more': 'Página completa del evento',
    'detail.guides': 'Mostrar guías de llegada P / S',
    'detail.waveHint': 'Recorre una traza para ver qué parte de la onda estás viendo. Haz clic para leer la explicación.',
    'type.blast': 'Voladura de cantera',
    'type.quake': 'Sismo',
    'detail.picks': 'lecturas',
    'detail.stations': 'estaciones',

    // ── quarries
    'sites.h2': 'De dónde vienen las voladuras',
    'sites.lead': '{inSites} de {total} voladuras vienen de {n} zonas pequeñas de unos pocos kilómetros. Son canteras en operación. Solo {top} concentra {topN}.',
    'sites.note': 'Las voladuras a menos de 3 km entre sí se agrupan como un mismo sitio. Los grupos salen solo de nuestros datos; no los hemos relacionado con ninguna empresa. Haz clic en un sitio para ver solo sus voladuras.',
    'sites.site': 'Sitio {letter}',
    'sites.blasts': 'voladuras',
    'sites.blast': 'voladura',
    'sites.usually': 'normalmente {hour}',

    // ── charts
    'patterns.h2': 'Más del catálogo',
    'patterns.sub': 'Estas gráficas siguen los filtros de arriba: elige un sitio, una hora o una búsqueda y se actualizan.',
    'patterns.showing': 'Mostrando {n} eventos{site}.',
    'patterns.fromSite': ' del {site}',
    'chart.dow': 'Día de la semana',
    'chart.month': 'Eventos por mes',
    'chart.mag': 'Magnitud',
    'chart.eventsLabel': '{n} eventos',
    'chart.oneEvent': '1 evento',

    // ── felt / DYFI
    'felt.h2': '¿Sentiste algo?',
    'felt.bannerBody': 'Si sentiste que se movió el suelo, llena el formulario “Did You Feel It?” del USGS. Toma como un minuto. En esta región hay pocos sismómetros, así que los reportes de los residentes completan lo que los instrumentos no alcanzan a registrar.',
    'felt.bannerCta': 'Reportar al USGS',
    'felt.bannerNote': 'Abre earthquake.usgs.gov (disponible en español). Esta red es un proyecto de investigación universitario, no un servicio de alerta ni de emergencia. En una emergencia, llama al 911.',
    'faq.q1': 'Sentí un golpe por la tarde. ¿Fue un sismo?',
    'faq.a1': 'Probablemente no. Casi todos los eventos que hemos registrado son voladuras de cantera, y la mayoría ocurre entre semana por la tarde. Si fue una voladura, debería aparecer en la lista en unas semanas.',
    'faq.q2': '¿Cómo distingo una voladura de un sismo?',
    'faq.a2': 'Una voladura suele sentirse como un solo golpe seco. A veces se oye un estruendo por el aire uno o dos segundos después de que se mueve el suelo, porque el sonido viaja mucho más lento que la vibración en la roca. Las voladuras ocurren en horario de trabajo y desde los mismos pocos lugares. Un sismo puede ocurrir a cualquier hora y casi en cualquier lugar.',
    'faq.q3': '¿Las voladuras pueden dañar mi casa?',
    'faq.a3': 'Los eventos que registramos son pequeños (mira la gráfica de magnitud). Si te preocupan las voladuras cerca de tu casa, comunícate con la empresa de la cantera o con la autoridad que regula la minería en tu estado. Podemos decirte cuándo ocurrieron los eventos, pero no podemos evaluar daños.',
    'faq.q4': '¿Por qué no aparece nada de las últimas semanas?',
    'faq.a4': 'Una persona revisa cada evento antes de publicarlo, así que hay un retraso. Si no hay nada reciente, normalmente es porque todavía no lo revisamos, no porque no haya pasado nada.',

    // ── about

    // ── wave explainer
    'wave.noise.title': 'Antes del evento: ruido de fondo',
    'wave.noise.body': 'El suelo nunca está quieto. El viento, el tráfico, la maquinaria e incluso el oleaje del océano lejano lo mantienen vibrando a este nivel todo el día. Cada detección de la red tiene que destacar sobre esta base, y por eso los eventos pequeños solo se encuentran cerca de una estación.',
    'wave.p.title': 'Onda P: la primera llegada',
    'wave.p.body': 'Una onda de compresión: comprime y estira la roca en su misma dirección de viaje, igual que el sonido en el aire. Es lo más rápido que libera la fuente, alrededor de 6 km/s en esta corteza, así que siempre llega primero. Suele ser pequeña; la sacudida fuerte llega después.',
    'wave.s.title': 'Onda S: la segunda llegada',
    'wave.s.body': 'Una onda de corte: mueve la roca de lado, de forma transversal a su dirección de viaje, como el latigazo de una cuerda. Viaja a unos 3.5 km/s, así que se queda cada vez más atrás de la P conforme avanza, y por eso la separación entre ambas indica la distancia. La S normalmente es mucho mayor que la P y no puede atravesar líquidos.',
    'wave.coda.title': 'Coda: la cola que se apaga',
    'wave.coda.body': 'Energía que rebotó en fracturas, capas y relieve enterrado durante el camino, y que llega tarde y desde todas direcciones a la vez. Qué tan lento se apaga la coda es en sí una medición: describe qué tan fracturada está la roca del trayecto.',
    'wave.region.noise': 'ruido de fondo',
    'wave.region.p': 'onda P',
    'wave.region.s': 'onda S',
    'wave.region.coda': 'coda',
    'wave.fact.arrival': 'Llegada {kind} a {t} tras el evento, a {d} km',
    'wave.fact.picked': 'medida',
    'wave.fact.predicted': 'estimada',
    'wave.fact.sp': 'Aquí la S llega {sp} s después de la P, y esa separación crece con la distancia: así una sola estación puede estimar qué tan lejos ocurrió',
    'wave.fact.spClose': 'La regla estándar S−P da unos {est} km, cerca de los {real} km localizados',
    'wave.fact.spOff': 'La regla estándar S−P da unos {est} km frente a los {real} km localizados. La regla supone un trayecto profundo por la corteza; para una estación tan cercana las ondas viajan por roca superficial más lenta, así que se pasa',
    'wave.close': 'Cerrar la explicación',

    // ── event page
    'event.record': 'La sección de registro',
    'event.recordSub': 'Todas las estaciones que registraron este evento, apiladas según su distancia. El tiempo corre de izquierda a derecha desde el momento del evento.',
    'event.pMoveout': 'Llegada P ({v} km/s)',
    'event.sMoveout': 'Llegada S ({v} km/s)',
    'event.pick': 'Lectura del analista',
    'event.byStation': 'Estación por estación',
    'event.byStationSub': 'Pasa el cursor o usa las flechas sobre cualquier traza para ver en qué parte de la onda estás; haz clic para la explicación.',
    'event.picksH2': 'Lecturas de fase',
    'event.picksSub': 'Los tiempos de llegada que marcó un analista, en segundos después del evento. Con eso se calculó la localización.',
    'event.where': 'Dónde ocurrió',
    'event.whereSub': 'El evento y las {n} estaciones que lo registraron. Las líneas punteadas son los trayectos que recorrieron las ondas.',
    'event.notFound': 'Evento no encontrado',
    'event.noId': 'No se indicó ningún evento. Elige uno del catálogo en la página del mapa.',
    'event.badId': 'No hay ningún evento con el id “{id}” en este catálogo.',
    'event.magnitude': 'Magnitud',
    'event.location': 'Ubicación',
    'event.stations': 'Estaciones',
    'event.phasePicks': 'Lecturas de fase',
    'event.nearest': 'Estación más cercana',
    'event.furthest': 'Estación más lejana',
    'event.thStation': 'Estación',
    'event.thPhase': 'Fase',
    'event.thArrival': 'Llegada',
    'event.thDistance': 'Distancia',
    'event.thEstimated': 'Estimada',
    'event.thLocated': 'Localizada',
    'event.spH3': 'Lo que la separación S−P diría por sí sola',
    'event.spBody': 'La S siempre llega después de la P, y la separación crece con la distancia. La separación de una estación estima su propia distancia: <code>distancia ≈ (S−P) × {k}</code> km. Esa constante se ajustó con las lecturas de este catálogo, no se tomó de un libro de texto: el valor de libro se equivoca como un 67% en estos trayectos.',
    'event.spNote': 'La regla supone un trayecto profundo por la corteza. Para una estación cercana al evento las ondas viajan por roca superficial más lenta, así que la estimación se pasa. Por eso una localización real usa todas las estaciones a la vez en lugar de una sola regla.',
    'event.spClose': 'cerca',
    'event.noWaves': 'No se archivaron sismogramas de este evento, así que no hay sección de registros que dibujar. Sus lecturas de fases aparecen abajo.',
    'event.recordNoteFew': 'Solo {n} estación registró este evento, así que casi no se aprecia la separación por distancia. Los eventos con cuatro o más estaciones lo muestran mucho mejor.',
    'event.recordNote': '{n} estaciones repartidas en {km} km. Entre más arriba en la gráfica, más lejos está la estación, y más amplia es la separación entre los puntos P y S, porque la S va perdiendo terreno todo el camino.',
    'event.depthNote': 'Profundidad reportada: {d} km. La profundidad es el dato peor resuelto en un catálogo local somero; la mayoría de los eventos aquí resultan a una profundidad por encima del nivel de referencia, y por eso se reporta pero no se grafica.',
    'event.localTime': 'hora local',

    // ── places
    'place.of': '{km} km al {dir} de {place}',
    'place.near': 'cerca de {place}',
    'nav.events': 'Eventos',
    'nav.blasts': 'Voladuras y sismos',
    'nav.about': 'Acerca de',
    'foot.name': 'Red Sísmica de El Paso · The University of Texas at El Paso',
    'hud.quake': 'sismo',
    'intro.h1': 'Sismos y voladuras de cantera en El Paso y Ciudad Juárez',
    'intro.lead': 'La Red Sísmica de El Paso es un proyecto operado por estudiantes de The University of Texas at El Paso (UTEP). Sismómetros comunitarios <b>Raspberry Shake</b> en El Paso y Ciudad Juárez, junto con <b>KIDD</b>, la estación de banda ancha de UTEP, registran el movimiento del suelo día y noche, y aquí publicamos cada evento que confirmamos. La mayoría son voladuras en canteras de la zona.',
    'feltCard.h': '¿Acabas de sentir un temblor?',
    'feltCard.body': 'Avísale al Servicio Geológico de EE. UU. (USGS). Los reportes de quienes lo sintieron ayudan a entender qué pasó, y solo toma un minuto.',
    'feltCard.note': 'Este sitio no se actualiza en tiempo real y no es un servicio de emergencia. En una emergencia, llama al 911.',
    'catalog.sub': 'Los más recientes primero, en hora local de El Paso.',
    'blasts.h2': 'Voladuras de cantera y sismos',
    'blasts.p1': 'Varias canteras alrededor de las Montañas Franklin y en Juárez usan explosivos para fragmentar la roca. Cada voladura sacude el suelo lo suficiente para que nuestras estaciones la registren, y muchas veces la gente cercana la siente o la oye. Casi todos los eventos de nuestro catálogo son voladuras.',
    'blasts.p2': 'Una voladura y un sismo se pueden distinguir. La voladura ocurre en la superficie, en horario de trabajo y desde los mismos pocos lugares. Un sismo empieza bajo tierra, puede ocurrir a cualquier hora y casi siempre en un lugar nuevo. Revisamos cada evento y lo clasificamos antes de publicarlo.',
    'expect.h3': 'Lo que muestran nuestros registros',
    'about.p2': 'Los sismos aquí son poco frecuentes, así que hay poco registro local de ellos. Estamos construyendo ese registro ahora. Nos da una base para comparar y, si algún día ocurre un sismo mayor, los instrumentos ya estarán instalados.',
    'about.howH': 'Cómo llega un evento a esta página',
    'about.step1': 'Cada estación registra el movimiento del suelo de forma continua, y recopilamos los datos cada noche.',
    'about.step2': 'Modelos de aprendizaje automático (PhaseNet y PhaseNO) marcan cuándo llegan las ondas sísmicas a cada estación.',
    'about.step3': 'Las llegadas que aparecen en varias estaciones a la vez se agrupan en un evento y se localizan (GaMMA, NonLinLoc).',
    'about.step4': 'Una persona revisa el evento, lo clasifica como voladura o sismo, y solo entonces lo publica aquí.',
    'about.dataH': 'Datos y código',
    'about.data': 'El catálogo es público. Puedes descargarlo en <a href="data/catalog.json">JSON</a>, leer la <a href="https://github.com/CIELO-G/elpaso-seismic/blob/main/DATA.md">descripción de los datos</a> (en inglés) o ver el <a href="https://github.com/CIELO-G/elpaso-quake-network">código de procesamiento</a> y el <a href="https://github.com/CIELO-G/elpaso-seismic">código del sitio</a> en GitHub.',
    'nav.how': 'Cómo funciona',
    'about.funding': 'La red forma parte de <a href="https://www.cielog.org/">CIELO-G</a> (Community-driven Inclusive Excellence and Leadership Opportunities in the Geosciences), financiado por la Fundación Nacional de Ciencias de EE. UU. (NSF) mediante el <a href="https://www.nsf.gov/awardsearch/show-award/?AWD_ID=2228180">premio n.º 2228180</a>. CIELO-G reúne a estudiantes, investigadores, docentes y organizaciones comunitarias para estudiar temas de geociencias en la región Paso del Norte, entre ellos el peligro sísmico en el oeste de Texas y el sur de Nuevo México.',
    'about.award': 'Financiado por el premio NSF n.º 2228180',
    'about.disclaimer': 'Este material se basa en trabajo financiado por la Fundación Nacional de Ciencias (NSF) mediante el premio n.º 2228180. Las opiniones, hallazgos, conclusiones o recomendaciones expresados aquí son de los autores y no reflejan necesariamente los puntos de vista de la NSF.',

  },
};

/* Compass points are read out loud in the local language. Spanish uses the
 * Spanish initials (N/S/E/O — O for oeste, not W). */
const COMPASS_I18N = {
  en: ['N', 'NNE', 'NE', 'ENE', 'E', 'ESE', 'SE', 'SSE',
       'S', 'SSW', 'SW', 'WSW', 'W', 'WNW', 'NW', 'NNW'],
  es: ['N', 'NNE', 'NE', 'ENE', 'E', 'ESE', 'SE', 'SSE',
       'S', 'SSO', 'SO', 'OSO', 'O', 'ONO', 'NO', 'NNO'],
};

let LANG = 'en';

function pickLang() {
  try {
    const saved = localStorage.getItem(I18N_KEY);
    if (LANGS.includes(saved)) return saved;
  } catch { /* private mode — fall through to the browser's preference */ }
  return (navigator.language || 'en').toLowerCase().startsWith('es') ? 'es' : 'en';
}

/* t('key', {n: 3}) — falls back to English, then to the key itself, so a
 * missing translation degrades to readable text instead of blank space. */
function t(key, vars) {
  let s = STRINGS[LANG]?.[key] ?? STRINGS.en[key] ?? key;
  if (vars) for (const [k, v] of Object.entries(vars)) s = s.split(`{${k}}`).join(v);
  return s;
}

const compassPoints = () => COMPASS_I18N[LANG] || COMPASS_I18N.en;

/* Fills every [data-i18n] element. Values may contain the small amount of
 * inline markup the copy needs (<b>, <i>, <code>), so this assigns HTML —
 * the strings are ours, not user input. */
function applyI18n(root = document) {
  root.querySelectorAll('[data-i18n]').forEach(el => {
    el.innerHTML = t(el.dataset.i18n);
  });
  root.querySelectorAll('[data-i18n-attr]').forEach(el => {
    for (const pair of el.dataset.i18nAttr.split(',')) {
      const [attr, key] = pair.split(':').map(s => s.trim());
      if (attr && key) el.setAttribute(attr, t(key));
    }
  });
  document.documentElement.lang = LANG;
}

/* Everything generated in JS re-renders through here. Each page registers
 * what it needs to redraw when the language changes. */
const langListeners = [];
const onLangChange = fn => langListeners.push(fn);

function setLang(lang) {
  if (!LANGS.includes(lang) || lang === LANG) return;
  LANG = lang;
  try { localStorage.setItem(I18N_KEY, lang); } catch { /* not fatal */ }
  applyI18n();
  for (const fn of langListeners) fn();
}

let langWired = false;

function wireLangToggle() {
  const btn = document.getElementById('lang-btn');
  if (!btn || langWired) return;
  langWired = true;
  const paint = () => {
    btn.textContent = t('lang.toggle');
    btn.setAttribute('aria-label', t('lang.label'));
  };
  paint();
  onLangChange(paint);
  btn.addEventListener('click', () => setLang(LANG === 'en' ? 'es' : 'en'));
}

LANG = pickLang();

/* Every page loads its scripts at the end of <body>, so the DOM is ready
 * here. Doing this centrally means a page cannot forget to translate
 * itself, and a Spanish-preferring browser never sees an English flash. */
applyI18n();
wireLangToggle();
