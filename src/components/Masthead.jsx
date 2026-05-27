// The newspaper masthead: dateline meta, flanking heraldic crests,
// the title and subtitle, and the four-column information strap.

function LionCrest() {
  return (
    <svg width="60" height="62" viewBox="0 0 80 80" aria-hidden="true">
      <path
        d="M40 8 L62 18 L66 36 C66 50 56 64 40 72 C24 64 14 50 14 36 L18 18 Z"
        fill="none"
        stroke="#1a1410"
        strokeWidth="1.2"
      />
      <path
        d="M40 22 C36 22 33 25 33 28 L30 30 L28 33 L31 33 L31 37 L34 38 L34 42 L37 44 L40 50 L43 44 L46 42 L46 38 L49 37 L49 33 L52 33 L50 30 L47 28 C47 25 44 22 40 22 Z"
        fill="#1a1410"
      />
      <path d="M30 56 L40 60 L50 56" stroke="#1a1410" strokeWidth="1" fill="none" />
    </svg>
  );
}

function TrophyCrest() {
  return (
    <svg width="60" height="62" viewBox="0 0 80 80" aria-hidden="true">
      <path
        d="M28 14 H52 V30 C52 40 47 46 40 47 C33 46 28 40 28 30 Z"
        fill="none"
        stroke="#1a1410"
        strokeWidth="1.2"
      />
      <path d="M22 18 C18 18 18 26 22 28 L28 26" fill="none" stroke="#1a1410" strokeWidth="1.2" />
      <path d="M58 18 C62 18 62 26 58 28 L52 26" fill="none" stroke="#1a1410" strokeWidth="1.2" />
      <rect x="34" y="47" width="12" height="6" fill="#1a1410" />
      <rect x="28" y="53" width="24" height="4" fill="#1a1410" />
      <rect x="22" y="57" width="36" height="5" fill="none" stroke="#1a1410" strokeWidth="1.2" />
      <line x1="34" y1="22" x2="46" y2="22" stroke="#1a1410" strokeWidth="0.8" />
      <line x1="35" y1="32" x2="45" y2="32" stroke="#1a1410" strokeWidth="0.8" />
    </svg>
  );
}

export default function Masthead({ enrolled }) {
  const strap = [
    { label: 'Weather · Brunswick', detail: 'Fair, 24°C · gentle westerly breeze' },
    { label: 'Pitch Conditions', detail: 'Good · last cut Tuesday' },
    { label: 'The Competition', detail: 'FIFA World Cup · MMXXVI' },
    {
      label: 'League Membership',
      detail: `${enrolled != null ? enrolled.toLocaleString('en-GB') : '12,447'} patriots enrolled`,
    },
  ];

  return (
    <header className="masthead">
      <div className="masthead-meta">
        <div className="left">
          <span>Established MMXXVI</span>
          <span className="pip" />
          <span>Vol. I · No. XII</span>
        </div>
        <div className="right">
          <span>Prishtinë, Kosovo</span>
          <span className="pip" />
          <span>Saturday, 14 June MMXXVI</span>
          <span className="pip" />
          <span>1 Euro</span>
        </div>
      </div>

      <div className="masthead-crests" style={{ borderBottom: 0 }}>
        <LionCrest />
        <div />
        <TrophyCrest />
      </div>

      <div className="masthead-title" style={{ marginTop: '-46px' }}>
        <h1>
          The <em className="amp">Prediction</em> Post
        </h1>
        <div className="masthead-subtitle">
          Prishtinë's Tribune of the World Cup Prediction League · A Daily Journal for the Patriot &amp; the Punter
        </div>
      </div>

      <div className="masthead-strap">
        {strap.map(({ label, detail }) => (
          <div key={label}>
            <strong>{label}</strong>
            {detail}
          </div>
        ))}
      </div>
    </header>
  );
}
