// Map nation names (and a few FIFA 3-letter codes) to ISO 3166-1 alpha-2
// codes used by flagcdn.com, so we can show real flags instead of placeholder art.
const NAME_TO_ISO = {
  kosovo: 'xk', albania: 'al', mexico: 'mx', 'south africa': 'za',
  'south korea': 'kr', 'korea republic': 'kr', czechia: 'cz', 'czech republic': 'cz',
  canada: 'ca', 'bosnia-herzegovina': 'ba', 'bosnia and herzegovina': 'ba',
  'united states': 'us', usa: 'us', paraguay: 'py', germany: 'de', poland: 'pl',
  france: 'fr', australia: 'au', england: 'gb-eng', scotland: 'gb-sct', wales: 'gb-wls',
  argentina: 'ar', brazil: 'br', serbia: 'rs', spain: 'es', morocco: 'ma',
  qatar: 'qa', switzerland: 'ch', portugal: 'pt', netherlands: 'nl', belgium: 'be',
  croatia: 'hr', italy: 'it', uruguay: 'uy', japan: 'jp', senegal: 'sn', ghana: 'gh',
  nigeria: 'ng', cameroon: 'cm', egypt: 'eg', tunisia: 'tn', algeria: 'dz',
  ecuador: 'ec', colombia: 'co', peru: 'pe', chile: 'cl', iran: 'ir',
  'saudi arabia': 'sa', denmark: 'dk', sweden: 'se', norway: 'no', austria: 'at',
  turkey: 'tr', 'türkiye': 'tr', ukraine: 'ua', 'costa rica': 'cr', panama: 'pa',
  jamaica: 'jm', 'new zealand': 'nz', honduras: 'hn', "côte d'ivoire": 'ci',
  "cote d'ivoire": 'ci', 'ivory coast': 'ci', mali: 'ml', 'dr congo': 'cd',
  greece: 'gr', slovenia: 'si', slovakia: 'sk', romania: 'ro', hungary: 'hu',
  'cape verde': 'cv', 'cabo verde': 'cv', curacao: 'cw', 'curaçao': 'cw',
  jordan: 'jo', uzbekistan: 'uz', iraq: 'iq', 'united arab emirates': 'ae',
  bolivia: 'bo', venezuela: 've', china: 'cn', 'china pr': 'cn',
};

// FIFA 3-letter → ISO 2 for the codes football-data stores in matches.*_code.
const FIFA_TO_ISO = {
  KVX: 'xk', KOS: 'xk', ALB: 'al', MEX: 'mx', RSA: 'za', KOR: 'kr', CZE: 'cz',
  CAN: 'ca', BIH: 'ba', USA: 'us', PAR: 'py', GER: 'de', POL: 'pl', FRA: 'fr',
  AUS: 'au', ENG: 'gb-eng', SCO: 'gb-sct', WAL: 'gb-wls', ARG: 'ar', BRA: 'br',
  SRB: 'rs', ESP: 'es', MAR: 'ma', QAT: 'qa', SUI: 'ch', POR: 'pt', NED: 'nl',
  BEL: 'be', CRO: 'hr', ITA: 'it', URU: 'uy', JPN: 'jp', SEN: 'sn', GHA: 'gh',
  NGA: 'ng', CMR: 'cm', EGY: 'eg', TUN: 'tn', ALG: 'dz', ECU: 'ec', COL: 'co',
  PER: 'pe', CHI: 'cl', IRN: 'ir', KSA: 'sa', DEN: 'dk', SWE: 'se', NOR: 'no',
  AUT: 'at', TUR: 'tr', UKR: 'ua', CRC: 'cr', PAN: 'pa', JAM: 'jm', NZL: 'nz',
  CIV: 'ci', MLI: 'ml', COD: 'cd', GRE: 'gr', CPV: 'cv', CUW: 'cw', JOR: 'jo',
  UZB: 'uz', IRQ: 'iq', UAE: 'ae', BOL: 'bo', VEN: 've', CHN: 'cn',
};

// Returns an ISO code for flagcdn, or null (placeholder shown instead).
export function isoFor(team, code) {
  if (code && FIFA_TO_ISO[code.toUpperCase()]) return FIFA_TO_ISO[code.toUpperCase()];
  if (team && NAME_TO_ISO[team.trim().toLowerCase()]) return NAME_TO_ISO[team.trim().toLowerCase()];
  return null;
}

export const flagUrl = (iso) => `https://flagcdn.com/${iso}.svg`;
