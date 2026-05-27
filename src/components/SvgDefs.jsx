// Shared SVG <defs> — the halftone dot patterns and the reusable vintage
// football illustration. Rendered once near the root so the artwork below
// can reference them by id (e.g. url(#halftone-fine), href="#oldball").
const defs = `
  <defs>
    <pattern id="halftone" patternUnits="userSpaceOnUse" width="6" height="6">
      <circle cx="3" cy="3" r="1.6" fill="#1a1410"/>
    </pattern>
    <pattern id="halftone-fine" patternUnits="userSpaceOnUse" width="4" height="4">
      <circle cx="2" cy="2" r="0.9" fill="#1a1410"/>
    </pattern>
    <radialGradient id="halftone-radial">
      <stop offset="0" stop-color="#1a1410" stop-opacity="0.95"/>
      <stop offset="0.6" stop-color="#1a1410" stop-opacity="0.4"/>
      <stop offset="1" stop-color="#1a1410" stop-opacity="0"/>
    </radialGradient>
    <symbol id="oldball" viewBox="0 0 200 200">
      <circle cx="100" cy="100" r="86" fill="#efe6d2" stroke="#1a1410" stroke-width="2"/>
      <polygon points="100,46 138,76 124,122 76,122 62,76" fill="#1a1410" stroke="#1a1410"/>
      <g stroke="#1a1410" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round">
        <line x1="100" y1="46" x2="100" y2="14"/>
        <line x1="138" y1="76" x2="170" y2="70"/>
        <line x1="124" y1="122" x2="156" y2="148"/>
        <line x1="76" y1="122" x2="44" y2="148"/>
        <line x1="62" y1="76" x2="30" y2="70"/>
        <path d="M70 18 L100 14 L130 18"/>
        <path d="M170 70 L180 100 L172 132"/>
        <path d="M156 148 L130 170 L100 174"/>
        <path d="M100 174 L70 170 L44 148"/>
        <path d="M28 132 L20 100 L30 70"/>
      </g>
      <ellipse cx="120" cy="155" rx="60" ry="22" fill="url(#halftone-radial)" opacity="0.35"/>
    </symbol>
  </defs>
`;

export default function SvgDefs() {
  return (
    <svg
      width="0"
      height="0"
      style={{ position: 'absolute' }}
      aria-hidden="true"
      dangerouslySetInnerHTML={{ __html: defs }}
    />
  );
}
