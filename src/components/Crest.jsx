// Stylised 60×60 flag crests for each nation, rendered as clean inline SVG.
// Used in the fixtures grid. Keyed by the exact team name used in the data.
const crests = {
  Kosovo: (
    <>
      <rect width="60" height="60" fill="#244AA5" />
      <path
        d="M16 32 Q14 26 18 22 Q24 18 30 20 Q38 19 44 24 Q48 30 44 36 Q40 42 32 42 Q22 42 16 36 Z"
        fill="#D0A650"
      />
    </>
  ),
  Albania: (
    <>
      <rect width="60" height="60" fill="#E41E20" />
      <path
        d="M30 16 L26 22 L22 22 L24 26 L20 28 L24 32 L20 36 L24 38 L28 38 L28 44 L32 44 L32 38 L36 38 L40 36 L36 32 L40 28 L36 26 L38 22 L34 22 Z"
        fill="#000"
      />
    </>
  ),
  France: (
    <>
      <rect width="60" height="60" fill="#0055A4" />
      <rect x="20" width="20" height="60" fill="#fff" />
      <rect x="40" width="20" height="60" fill="#EF4135" />
    </>
  ),
  Australia: (
    <>
      <rect width="60" height="60" fill="#00843D" />
      <rect y="30" width="60" height="30" fill="#FFCD00" />
    </>
  ),
  England: (
    <>
      <rect width="60" height="60" fill="#fff" />
      <rect x="25" width="10" height="60" fill="#CE1124" />
      <rect y="25" width="60" height="10" fill="#CE1124" />
    </>
  ),
  'United States': (
    <>
      <rect width="60" height="60" fill="#fff" />
      <rect y="0" width="60" height="4.5" fill="#B22234" />
      <rect y="9" width="60" height="4.5" fill="#B22234" />
      <rect y="18" width="60" height="4.5" fill="#B22234" />
      <rect y="27" width="60" height="4.5" fill="#B22234" />
      <rect y="36" width="60" height="4.5" fill="#B22234" />
      <rect y="45" width="60" height="4.5" fill="#B22234" />
      <rect y="54" width="60" height="4.5" fill="#B22234" />
      <rect width="26" height="32" fill="#3C3B6E" />
    </>
  ),
  Germany: (
    <>
      <rect width="60" height="60" fill="#FFCC00" />
      <rect width="60" height="20" fill="#000" />
      <rect y="20" width="60" height="20" fill="#DD0000" />
    </>
  ),
  Poland: (
    <>
      <rect width="60" height="30" fill="#fff" />
      <rect y="30" width="60" height="30" fill="#DC143C" />
    </>
  ),
  Argentina: (
    <>
      <rect width="60" height="60" fill="#75AADB" />
      <rect y="20" width="60" height="20" fill="#fff" />
    </>
  ),
  Mexico: (
    <>
      <rect width="20" height="60" fill="#006847" />
      <rect x="20" width="20" height="60" fill="#fff" />
      <rect x="40" width="20" height="60" fill="#CE1126" />
    </>
  ),
  Brazil: (
    <>
      <rect width="60" height="60" fill="#FEDF00" />
      <polygon points="30,12 52,30 30,48 8,30" fill="#009C3B" />
    </>
  ),
  Serbia: (
    <>
      <rect width="60" height="20" fill="#C6363C" />
      <rect y="20" width="60" height="20" fill="#0C4076" />
      <rect y="40" width="60" height="20" fill="#fff" />
    </>
  ),
  Spain: (
    <>
      <rect width="60" height="60" fill="#AA151B" />
      <rect y="15" width="60" height="30" fill="#F1BF00" />
    </>
  ),
  Morocco: (
    <>
      <rect width="60" height="60" fill="#C1272D" />
      <polygon
        points="30,18 33,28 43,28 35,34 38,44 30,38 22,44 25,34 17,28 27,28"
        fill="none"
        stroke="#006233"
        strokeWidth="2"
      />
    </>
  ),
};

// Fallback for teams without a drawn crest (knockout placeholders, teams
// pulled later from the football API): a plain paper field with initials.
function fallbackCrest(team, code) {
  const label =
    code ||
    team
      .split(/\s+/)
      .map((w) => w[0])
      .join('')
      .slice(0, 3)
      .toUpperCase();
  return (
    <>
      <rect width="60" height="60" fill="var(--paper-light)" />
      <text
        x="30"
        y="30"
        textAnchor="middle"
        dominantBaseline="central"
        fontFamily="Oswald, sans-serif"
        fontSize="18"
        fill="#1a1410"
      >
        {label}
      </text>
    </>
  );
}

export default function Crest({ team, code, className = 'crest' }) {
  return (
    <svg className={className} viewBox="0 0 60 60" aria-hidden="true" style={className !== 'crest' ? { width: '100%', height: '100%', display: 'block' } : undefined}>
      {crests[team] ?? fallbackCrest(team, code)}
    </svg>
  );
}
