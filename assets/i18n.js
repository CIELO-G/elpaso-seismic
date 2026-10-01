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
    'brand.sub': 'Public event catalog — updated daily',
    'nav.finding': 'The finding',
    'nav.catalog': 'Catalog',
    'nav.quarries': 'Quarries',
    'nav.felt': 'Felt something?',
    'nav.back': '← Back to the map',
    'nav.backCatalog': '← Back to the full catalog',
    'lang.toggle': 'Español',
    'lang.label': 'Cambiar a español',
    'skip.list': 'Skip to the event list',
    'skip.record': 'Skip to the record section',
    'foot.pipeline': 'pipeline source',
    'foot.site': 'site source',

    // ── map band
    'hud.events': 'events',
    'hud.blasts': 'blasts',
    'hud.quakes': 'quakes',
    'hud.stations': 'stations',
    'legend.blast': 'Quarry blast',
    'legend.quake': 'Earthquake',
    'legend.station': 'Station',
    'legend.cluster': 'Quarry cluster',
    'map.caption': 'Circle size scales with magnitude. Dashed rings are repeat-blast clusters — the working pits. Select anything to dig in.',
    'map.fullscreen': 'View map full screen',
    'map.exitFullscreen': 'Exit full screen',

    // ── freshness
    'fresh.recent': 'Most recent recorded event: {date} ({n} days ago).',
    'fresh.lag': 'Events are reviewed by hand before they appear here, so the last few weeks are normally empty.',
    'fresh.updated': 'Catalog last refreshed {date}',

    // ── story
    'story.eyebrow': 'El Paso · Ciudad Juárez · since 2025',
    'story.h1': 'The ground here keeps office hours.',
    'story.sub': 'Nearly everything this network records is a <b>quarry blast</b> — rock broken on a schedule by people at work. Real earthquakes keep no schedule at all. That difference is visible in a single chart.',
    'story.figureLabel': 'of quarry blasts land in the {hour} hour, local time',
    'story.caption': '{peak} of {total} blasts fall in that single hour, and {pct}% land inside the work day.',
    'story.captionQuake': ' The magenta bar is an earthquake — {date} at {time}. Earthquakes keep no schedule.',
    'chart.when': 'When events happen',
    'chart.whenSub': 'Hour of day, El Paso local time',
    'chart.selectBar': 'Select a bar to filter every view below to that hour.',
    'chart.workday': 'work day',

    // ── what to expect
    'expect.h2': 'What to expect if you live near a quarry',
    'expect.sub': 'Blasting is scheduled work, so it has a rhythm you can recognise.',
    'expect.when': 'Most blasts happen on a <b>weekday afternoon</b>, most often around <b>{hour}</b>.',
    'expect.gap': 'Across this catalog there are typically <b>{gap} days</b> between events, though the longest quiet spell was {max} days.',
    'expect.sunday': 'Sunday is almost always quiet — {sun} of {total} blasts.',
    'expect.caveat': 'This describes what the catalog has recorded, not a schedule anyone published. It is a pattern, not a prediction.',
    'expect.boom': 'A blast usually reads as one sharp bang or thud with a bit of rattle. Often you hear an air-blast “boom” a second or two <i>after</i> the ground moves — sound through air is far slower than shaking through rock.',

    // ── catalog
    'catalog.h2': 'Event catalog',
    'catalog.search': 'Search date, type, site, ID…',
    'catalog.searchLabel': 'Search events',
    'catalog.empty': 'No events match those filters.',
    'catalog.showing': 'Showing all {n} events.',
    'catalog.matching': '{n} events match the current filters.',
    'catalog.clearAll': 'Clear all',
    'catalog.nEvents': '{n} events',
    'catalog.oneEvent': '1 event',
    'detail.select': 'Select an event',
    'detail.hint': 'Pick an event on the map or in the list to see the ground motion each station actually recorded.',
    'detail.more': 'See this event in full detail',
    'detail.guides': 'Show P / S move-out guides',
    'detail.waveHint': 'Hover or arrow along any trace to see what part of the wave you are on — click it for the explanation.',
    'type.blast': 'Quarry blast',
    'type.quake': 'Earthquake',
    'detail.picks': 'picks',
    'detail.stations': 'stations',

    // ── quarries
    'sites.h2': 'The quarries show up as clusters',
    'sites.lead': '{inSites} of {total} blasts fall into {n} tight clusters a few kilometres across — the working pits. {top} alone accounts for {topN}, all within {spread} km of each other.',
    'sites.note': 'Grouped by location alone — any two blasts within 3 km of each other are treated as the same pit. Select a site to filter the map, the catalog and every chart to that quarry. These are clusters found in the data, not identified operators.',
    'sites.site': 'Site {letter}',
    'sites.blasts': 'blasts',
    'sites.blast': 'blast',
    'sites.usually': 'usually {hour}',

    // ── charts
    'patterns.h2': 'Other patterns in the catalog',
    'patterns.sub': 'Every chart below responds to the filters above.',
    'patterns.showing': 'Showing {n} events{site}.',
    'patterns.fromSite': ' from {site}',
    'chart.dow': 'Day of week',
    'chart.month': 'Events per month',
    'chart.mag': 'Magnitude',
    'chart.eventsLabel': '{n} events',
    'chart.oneEvent': '1 event',

    // ── felt / DYFI
    'felt.h2': 'Felt something?',
    'felt.sub': 'What that jolt probably was, and where to report it.',
    'felt.bannerTitle': 'Did you feel it? Tell the USGS.',
    'felt.bannerBody': 'Your report becomes real data. This area has thin instrument coverage, so what people felt genuinely helps fill the gaps — it takes about a minute.',
    'felt.bannerCta': 'Report it to USGS “Did You Feel It?”',
    'felt.bannerNote': 'Opens earthquake.usgs.gov. This network is a student research project, not an emergency service. In an emergency, call 911.',
    'faq.q1': 'I felt a jolt in the afternoon. Was that an earthquake?',
    'faq.a1': 'Most likely it was a quarry blast. Nearly every event in this catalog is one, and they cluster hard into the late afternoon — check the chart at the top of this page.',
    'faq.q2': 'How do I tell a blast from an earthquake?',
    'faq.a2': 'Three rough tests, all of which you can check on this page: blasts happen during working hours, they repeat from the same few locations (see the site clusters above), and they are shallow. An earthquake can happen at any hour, usually somewhere new, and is normally deeper.',
    'faq.q3': 'Should I be worried about damage from blasting?',
    'faq.a3': 'The events here are small — see the magnitude chart for the range this catalog actually spans. If blasting is shaking your home, the people to talk to are the quarry operator and your state regulator; this catalog can tell you when events happened, but it is not a damage assessment.',
    'faq.q4': 'Why is there nothing from the last few weeks?',
    'faq.a4': 'Every event is reviewed by a person before it is published, so there is a lag between something happening and it appearing here. A quiet recent stretch usually means “not reviewed yet”, not “nothing happened”.',

    // ── about
    'about.h2': 'About this network',
    'about.body': 'A small research seismic network operated in the El Paso, Texas region, combining Raspberry Shake community seismometers with the broadband station KIDD (UTEP). Events are detected automatically with machine learning (PhaseNet), associated (GaMMA), located (NonLinLoc), and manually reviewed before appearing here. Most detections are <b>quarry blasts</b> from mining operations around the Franklin Mountains and Juárez; the catalog also contains locally recorded <b>earthquakes</b>.',

    // ── wave explainer
    'wave.noise.title': 'Before the event — background noise',
    'wave.noise.body': 'The ground is never still. Wind, traffic, machinery and even distant ocean swell keep it trembling at this level all day. Every detection the network makes has to stand out from this baseline, which is why small events are only found close to a station.',
    'wave.p.title': 'P wave — the first arrival',
    'wave.p.body': 'A compressional wave: it squeezes and stretches the rock along its own direction of travel, exactly like sound moving through air. It is the fastest thing the source releases — roughly 6 km/s through this crust — so it always arrives first. It is often small; the strong shaking usually comes later.',
    'wave.s.title': 'S wave — the second arrival',
    'wave.s.body': 'A shear wave: it moves the rock sideways, across its direction of travel, like a flick down a rope. It travels at roughly 3.5 km/s, so it falls steadily further behind P the further it goes — which is why the gap between the two tells you the distance. S is normally much larger than P, and it cannot pass through liquid.',
    'wave.coda.title': 'Coda — the decaying tail',
    'wave.coda.body': 'Energy that has bounced off cracks, layers and buried topography on its way here, arriving late and from every direction at once. How slowly the coda dies away is itself a measurement — it describes how broken up the rock along the path is.',
    'wave.region.noise': 'background noise',
    'wave.region.p': 'P wave',
    'wave.region.s': 'S wave',
    'wave.region.coda': 'coda',
    'wave.fact.arrival': '{kind} arrival {t} after the event, {d} km out',
    'wave.fact.picked': 'Picked',
    'wave.fact.predicted': 'Predicted',
    'wave.fact.sp': 'S trails P by {sp} s here, and that gap widens with distance — which is how one station alone can estimate range',
    'wave.fact.spClose': 'The standard S−P rule gives about {est} km, close to the located {real} km',
    'wave.fact.spOff': 'The standard S−P rule gives about {est} km against a located {real} km. The rule assumes a deep crustal path; for a station this close the waves stay in slower shallow rock, so it overshoots',
    'wave.close': 'Close explanation',

    // ── event page
    'event.record': 'The record section',
    'event.recordSub': 'Every station that recorded this event, stacked by how far away it is. Time runs left to right from the moment the event happened.',
    'event.pMoveout': 'P move-out (6.0 km/s)',
    'event.sMoveout': 'S move-out (3.5 km/s)',
    'event.pick': 'Analyst pick',
    'event.byStation': 'Station by station',
    'event.byStationSub': 'Hover or arrow along any trace to see what part of the wave you are on — click it for the explanation.',
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
    'event.spBody': 'S always trails P, and the gap grows with distance. One station’s gap estimates its own range: <code>distance ≈ (S−P) × {k}</code> km, using {vp} and {vs} km/s.',
    'event.spNote': 'The rule assumes a deep crustal path. For a station close to the event the waves stay in slower, shallow rock, so the estimate overshoots — which is exactly why a real location uses every station at once instead of one rule of thumb.',
    'event.spClose': 'close',
    'event.recordNoteFew': 'Only {n} station recorded this event, so there is little move-out to see. Events recorded by four or more stations show the fan much better.',
    'event.recordNote': '{n} stations spanning {km} km. The further up the plot, the further the station — and the wider the gap between the P and S dots, because S loses ground the whole way.',
    'event.depthNote': 'Reported depth {d} km. Depth is the least well resolved number in a shallow local catalog — a majority of events here solve to a depth above the reference datum, which is why it is reported but not plotted.',
    'event.localTime': 'local time',

    // ── places
    'place.of': '{km} km {dir} of {place}',
    'place.near': 'near {place}',
  },

  es: {
    // ── chrome
    'brand.name': 'Red Sísmica de El Paso',
    'brand.sub': 'Catálogo público de eventos — actualizado a diario',
    'nav.finding': 'El hallazgo',
    'nav.catalog': 'Catálogo',
    'nav.quarries': 'Canteras',
    'nav.felt': '¿Lo sentiste?',
    'nav.back': '← Volver al mapa',
    'nav.backCatalog': '← Volver al catálogo completo',
    'lang.toggle': 'English',
    'lang.label': 'Switch to English',
    'skip.list': 'Ir a la lista de eventos',
    'skip.record': 'Ir a la sección de registro',
    'foot.pipeline': 'código del procesamiento',
    'foot.site': 'código del sitio',

    // ── map band
    'hud.events': 'eventos',
    'hud.blasts': 'voladuras',
    'hud.quakes': 'sismos',
    'hud.stations': 'estaciones',
    'legend.blast': 'Voladura de cantera',
    'legend.quake': 'Sismo',
    'legend.station': 'Estación',
    'legend.cluster': 'Grupo de cantera',
    'map.caption': 'El tamaño del círculo crece con la magnitud. Los anillos punteados son grupos de voladuras repetidas: las canteras activas. Selecciona cualquier cosa para ver más.',
    'map.fullscreen': 'Ver el mapa en pantalla completa',
    'map.exitFullscreen': 'Salir de pantalla completa',

    // ── freshness
    'fresh.recent': 'Evento más reciente registrado: {date} (hace {n} días).',
    'fresh.lag': 'Cada evento se revisa a mano antes de publicarse, así que las últimas semanas normalmente aparecen vacías.',
    'fresh.updated': 'Catálogo actualizado el {date}',

    // ── story
    'story.eyebrow': 'El Paso · Ciudad Juárez · desde 2025',
    'story.h1': 'Aquí la tierra trabaja en horario de oficina.',
    'story.sub': 'Casi todo lo que registra esta red es una <b>voladura de cantera</b>: roca fracturada según un horario, por gente en su jornada de trabajo. Los sismos de verdad no siguen ningún horario. Esa diferencia se ve en una sola gráfica.',
    'story.figureLabel': 'de las voladuras ocurren en la hora de las {hour}, hora local',
    'story.caption': '{peak} de {total} voladuras caen en esa sola hora, y el {pct}% ocurre dentro de la jornada laboral.',
    'story.captionQuake': ' La barra magenta es un sismo: {date} a las {time}. Los sismos no siguen horario.',
    'chart.when': 'Cuándo ocurren los eventos',
    'chart.whenSub': 'Hora del día, hora local de El Paso',
    'chart.selectBar': 'Selecciona una barra para filtrar todo lo de abajo a esa hora.',
    'chart.workday': 'jornada laboral',

    // ── what to expect
    'expect.h2': 'Qué esperar si vives cerca de una cantera',
    'expect.sub': 'Las voladuras son trabajo programado, así que siguen un ritmo reconocible.',
    'expect.when': 'La mayoría ocurre <b>entre semana por la tarde</b>, casi siempre alrededor de las <b>{hour}</b>.',
    'expect.gap': 'En este catálogo suelen pasar <b>{gap} días</b> entre un evento y otro, aunque el periodo más largo sin actividad fue de {max} días.',
    'expect.sunday': 'El domingo casi siempre está tranquilo: {sun} de {total} voladuras.',
    'expect.caveat': 'Esto describe lo que el catálogo ha registrado, no un horario que alguien haya publicado. Es un patrón, no un pronóstico.',
    'expect.boom': 'Una voladura suele sentirse como un solo golpe seco con algo de vibración. Muchas veces se oye un “bum” en el aire uno o dos segundos <i>después</i> de que se mueve el suelo: el sonido por el aire viaja mucho más lento que la sacudida por la roca.',

    // ── catalog
    'catalog.h2': 'Catálogo de eventos',
    'catalog.search': 'Busca fecha, tipo, sitio, ID…',
    'catalog.searchLabel': 'Buscar eventos',
    'catalog.empty': 'Ningún evento coincide con esos filtros.',
    'catalog.showing': 'Mostrando los {n} eventos.',
    'catalog.matching': '{n} eventos coinciden con los filtros actuales.',
    'catalog.clearAll': 'Quitar todo',
    'catalog.nEvents': '{n} eventos',
    'catalog.oneEvent': '1 evento',
    'detail.select': 'Selecciona un evento',
    'detail.hint': 'Elige un evento en el mapa o en la lista para ver el movimiento del suelo que registró cada estación.',
    'detail.more': 'Ver este evento a detalle',
    'detail.guides': 'Mostrar guías de llegada P / S',
    'detail.waveHint': 'Pasa el cursor o usa las flechas sobre cualquier traza para ver en qué parte de la onda estás; haz clic para la explicación.',
    'type.blast': 'Voladura de cantera',
    'type.quake': 'Sismo',
    'detail.picks': 'lecturas',
    'detail.stations': 'estaciones',

    // ── quarries
    'sites.h2': 'Las canteras aparecen como grupos',
    'sites.lead': '{inSites} de {total} voladuras caen en {n} grupos compactos de unos pocos kilómetros: las canteras activas. {top} por sí solo concentra {topN}, todas dentro de {spread} km entre sí.',
    'sites.note': 'Agrupadas solo por ubicación: dos voladuras a menos de 3 km se tratan como la misma cantera. Selecciona un sitio para filtrar el mapa, el catálogo y todas las gráficas a esa cantera. Son grupos encontrados en los datos, no empresas identificadas.',
    'sites.site': 'Sitio {letter}',
    'sites.blasts': 'voladuras',
    'sites.blast': 'voladura',
    'sites.usually': 'normalmente {hour}',

    // ── charts
    'patterns.h2': 'Otros patrones en el catálogo',
    'patterns.sub': 'Todas las gráficas responden a los filtros de arriba.',
    'patterns.showing': 'Mostrando {n} eventos{site}.',
    'patterns.fromSite': ' del {site}',
    'chart.dow': 'Día de la semana',
    'chart.month': 'Eventos por mes',
    'chart.mag': 'Magnitud',
    'chart.eventsLabel': '{n} eventos',
    'chart.oneEvent': '1 evento',

    // ── felt / DYFI
    'felt.h2': '¿Sentiste algo?',
    'felt.sub': 'Qué fue probablemente ese golpe, y dónde reportarlo.',
    'felt.bannerTitle': '¿Lo sentiste? Repórtalo al USGS.',
    'felt.bannerBody': 'Tu reporte se convierte en datos reales. Esta zona tiene pocos instrumentos, así que lo que la gente sintió ayuda de verdad a llenar los huecos. Toma como un minuto.',
    'felt.bannerCta': 'Reportar al USGS “Did You Feel It?”',
    'felt.bannerNote': 'Abre earthquake.usgs.gov (en inglés). Esta red es un proyecto estudiantil de investigación, no un servicio de emergencia. En una emergencia, llama al 911.',
    'faq.q1': 'Sentí un golpe por la tarde. ¿Fue un sismo?',
    'faq.a1': 'Lo más probable es que haya sido una voladura de cantera. Casi todos los eventos de este catálogo lo son, y se concentran mucho al final de la tarde: mira la gráfica al inicio de esta página.',
    'faq.q2': '¿Cómo distingo una voladura de un sismo?',
    'faq.a2': 'Tres pruebas aproximadas, todas verificables en esta página: las voladuras ocurren en horario laboral, se repiten desde los mismos pocos lugares (mira los grupos de arriba) y son superficiales. Un sismo puede ocurrir a cualquier hora, casi siempre en un lugar nuevo, y normalmente es más profundo.',
    'faq.q3': '¿Debería preocuparme por daños por las voladuras?',
    'faq.a3': 'Los eventos aquí son pequeños; mira la gráfica de magnitud para ver el rango que abarca este catálogo. Si las voladuras están sacudiendo tu casa, con quien hay que hablar es con la empresa de la cantera y con el regulador de tu estado. Este catálogo puede decirte cuándo ocurrieron los eventos, pero no es una evaluación de daños.',
    'faq.q4': '¿Por qué no hay nada de las últimas semanas?',
    'faq.a4': 'Cada evento lo revisa una persona antes de publicarse, así que hay un retraso entre que algo ocurre y que aparece aquí. Un periodo reciente sin datos normalmente significa “todavía no se revisa”, no “no pasó nada”.',

    // ── about
    'about.h2': 'Sobre esta red',
    'about.body': 'Una pequeña red sísmica de investigación en la región de El Paso, Texas, que combina sismómetros comunitarios Raspberry Shake con la estación de banda ancha KIDD (UTEP). Los eventos se detectan automáticamente con aprendizaje automático (PhaseNet), se asocian (GaMMA), se localizan (NonLinLoc) y se revisan a mano antes de aparecer aquí. La mayoría son <b>voladuras de cantera</b> de la minería alrededor de las Montañas Franklin y Juárez; el catálogo también contiene <b>sismos</b> registrados localmente.',

    // ── wave explainer
    'wave.noise.title': 'Antes del evento — ruido de fondo',
    'wave.noise.body': 'El suelo nunca está quieto. El viento, el tráfico, la maquinaria e incluso el oleaje del océano lejano lo mantienen vibrando a este nivel todo el día. Cada detección de la red tiene que destacar sobre esta base, y por eso los eventos pequeños solo se encuentran cerca de una estación.',
    'wave.p.title': 'Onda P — la primera llegada',
    'wave.p.body': 'Una onda de compresión: comprime y estira la roca en su misma dirección de viaje, igual que el sonido en el aire. Es lo más rápido que libera la fuente —alrededor de 6 km/s en esta corteza— así que siempre llega primero. Suele ser pequeña; la sacudida fuerte llega después.',
    'wave.s.title': 'Onda S — la segunda llegada',
    'wave.s.body': 'Una onda de corte: mueve la roca de lado, de forma transversal a su dirección de viaje, como el latigazo de una cuerda. Viaja a unos 3.5 km/s, así que se queda cada vez más atrás de la P conforme avanza, y por eso la separación entre ambas indica la distancia. La S normalmente es mucho mayor que la P y no puede atravesar líquidos.',
    'wave.coda.title': 'Coda — la cola que se apaga',
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
    'event.pMoveout': 'Llegada P (6.0 km/s)',
    'event.sMoveout': 'Llegada S (3.5 km/s)',
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
    'event.spBody': 'La S siempre llega después de la P, y la separación crece con la distancia. La separación de una estación estima su propia distancia: <code>distancia ≈ (S−P) × {k}</code> km, usando {vp} y {vs} km/s.',
    'event.spNote': 'La regla supone un trayecto profundo por la corteza. Para una estación cercana al evento las ondas viajan por roca superficial más lenta, así que la estimación se pasa. Por eso una localización real usa todas las estaciones a la vez en lugar de una sola regla.',
    'event.spClose': 'cerca',
    'event.recordNoteFew': 'Solo {n} estación registró este evento, así que casi no se aprecia la separación por distancia. Los eventos con cuatro o más estaciones lo muestran mucho mejor.',
    'event.recordNote': '{n} estaciones repartidas en {km} km. Entre más arriba en la gráfica, más lejos está la estación, y más amplia es la separación entre los puntos P y S, porque la S va perdiendo terreno todo el camino.',
    'event.depthNote': 'Profundidad reportada: {d} km. La profundidad es el dato peor resuelto en un catálogo local somero; la mayoría de los eventos aquí resultan a una profundidad por encima del nivel de referencia, y por eso se reporta pero no se grafica.',
    'event.localTime': 'hora local',

    // ── places
    'place.of': '{km} km al {dir} de {place}',
    'place.near': 'cerca de {place}',
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
