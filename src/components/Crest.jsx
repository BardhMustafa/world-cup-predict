import { isoFor, flagUrl } from '../lib/flags.js';

// Real country flag (flagcdn.com) at an explicit pixel size, or a monospace
// initials chip for unknown / TBD teams. Size is fixed in px (with width/height
// attributes) so the image can never inflate a flex/grid row.
export default function Crest({ team, code, size = 26, round = false }) {
  const box = {
    width: size, height: size, flex: '0 0 auto', overflow: 'hidden', lineHeight: 0,
    borderRadius: round ? '50%' : Math.round(size * 0.22), background: 'var(--surface-3)',
  };
  const iso = isoFor(team, code);

  if (iso) {
    return (
      <span style={{ ...box, display: 'inline-block' }}>
        <img
          width={size} height={size} src={flagUrl(iso)} alt={team || ''} loading="lazy"
          style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
        />
      </span>
    );
  }

  const label = (code || (team || '?').replace(/[^A-Za-z ]/g, '').split(/\s+/).map((w) => w[0]).join(''))
    .slice(0, 3).toUpperCase();
  return (
    <span style={{ ...box, display: 'inline-grid', placeItems: 'center', color: 'var(--text-dim)', fontFamily: 'var(--mono)', fontWeight: 700, fontSize: Math.max(9, Math.round(size * 0.32)) }}>
      {label}
    </span>
  );
}
