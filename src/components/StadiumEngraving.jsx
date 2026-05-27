// "Plate 1." — the vintage stadium engraving in the hero, drawn as a single
// static SVG. Preserved verbatim from the design to keep every halftone dot,
// light ray and stitch line exactly as drawn.
const art = `
  <rect width="420" height="460" fill="#f4ecd8"/>
  <rect x="0" y="0" width="420" height="180" fill="url(#halftone-fine)" opacity="0.18"/>
  <g stroke="#1a1410" stroke-width="1.2" fill="none" stroke-linejoin="round">
    <path d="M30 240 Q210 90 390 240"/>
    <path d="M30 240 Q210 130 390 240"/>
    <path d="M50 240 Q210 110 370 240 L370 250 Q210 122 50 250 Z" fill="url(#halftone-fine)" opacity="0.5" stroke="none"/>
    <line x1="60" y1="80" x2="60" y2="240" stroke-width="1.4"/>
    <line x1="360" y1="80" x2="360" y2="240" stroke-width="1.4"/>
    <ellipse cx="60" cy="80" rx="14" ry="6"/>
    <ellipse cx="360" cy="80" rx="14" ry="6"/>
    <path d="M48 86 L150 200 M72 86 L240 220 M348 86 L270 220 M372 86 L180 210" stroke-dasharray="2 4" stroke-width="0.8" opacity="0.6"/>
  </g>
  <g>
    <ellipse cx="210" cy="320" rx="190" ry="60" fill="#1f4233" stroke="#1a1410" stroke-width="1.5"/>
    <ellipse cx="210" cy="320" rx="180" ry="56" fill="none" stroke="#14302a" stroke-width="4" stroke-dasharray="30 30" opacity="0.8"/>
    <line x1="210" y1="265" x2="210" y2="375" stroke="#efe6d2" stroke-width="1"/>
    <ellipse cx="210" cy="320" rx="36" ry="11" fill="none" stroke="#efe6d2" stroke-width="1"/>
    <path d="M40 305 L80 295 L80 345 L40 335 Z" fill="none" stroke="#efe6d2" stroke-width="0.8"/>
    <path d="M380 305 L340 295 L340 345 L380 335 Z" fill="none" stroke="#efe6d2" stroke-width="0.8"/>
    <circle cx="210" cy="320" r="2" fill="#efe6d2"/>
  </g>
  <g transform="translate(280 360) scale(0.7)">
    <use href="#oldball" width="200" height="200"/>
  </g>
  <g transform="translate(28 30)">
    <rect width="120" height="44" fill="none" stroke="#6b1f24" stroke-width="1"/>
    <text x="60" y="20" text-anchor="middle" font-family="Old Standard TT, serif" font-style="italic" font-size="10" fill="#6b1f24" letter-spacing="2">MATCHDAY ONE</text>
    <text x="60" y="36" text-anchor="middle" font-family="Playfair Display, serif" font-weight="900" font-size="17" fill="#6b1f24">14·VI·26</text>
  </g>
  <g transform="translate(140 138)" fill="#1a1410" opacity="0.6">
    <g>
      <circle cx="0"  cy="0" r="3"/><circle cx="10" cy="-2" r="3"/><circle cx="22" cy="0" r="3"/><circle cx="34" cy="-1" r="3"/>
      <circle cx="46" cy="0" r="3"/><circle cx="58" cy="-2" r="3"/><circle cx="70" cy="0" r="3"/><circle cx="82" cy="-1" r="3"/>
      <circle cx="94" cy="0" r="3"/><circle cx="106" cy="-2" r="3"/><circle cx="118" cy="0" r="3"/><circle cx="130" cy="-1" r="3"/>
    </g>
    <path d="M58 -12 L58 -2 M58 -12 L72 -10 Q66 -8 72 -6 Z" fill="#6b1f24" stroke="#1a1410" stroke-width="0.4"/>
  </g>
`;

export default function StadiumEngraving() {
  return (
    <svg
      viewBox="0 0 420 460"
      style={{ display: 'block', width: '100%' }}
      aria-hidden="true"
      dangerouslySetInnerHTML={{ __html: art }}
    />
  );
}
