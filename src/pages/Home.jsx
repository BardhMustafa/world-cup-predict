import { Link } from 'react-router-dom';
import useHomeData from '../hooks/useHomeData.js';
import { useCountdownTo } from '../hooks/useCountdown.js';
import Crest from '../components/Crest.jsx';
import { IconArrow } from '../components/ui/icons.jsx';

const t = (iso) => new Date(iso).toLocaleTimeString('sq', { hour: '2-digit', minute: '2-digit', hour12: false });
const dlong = (iso) => new Date(iso).toLocaleDateString('sq', { weekday: 'short', day: 'numeric', month: 'short' });

const scoring = [
  ['Rezultat i saktë', '+10'],
  ['Fitues + diferencë golash', '+5'],
  ['Fitues i saktë', '+3'],
  ['Gabim', '0'],
];
const steps = [
  ['Regjistrohu', 'Krijo llogarinë falas me numrin tënd personal — një hyrje për çdo tifoz.'],
  ['Parashiko', 'Shëno rezultatin për çdo ndeshje para bilbilit të parë.'],
  ['Fito pikë', 'Pikët llogariten automatikisht sapo përfundon ndeshja.'],
  ['Ngjitu në renditje', 'Mund kundërshtarët dhe shpallu kampion i Kosovës.'],
];

function NextMatchCard({ match, nextKickoff }) {
  const c = useCountdownTo(nextKickoff);
  if (!match) return null;
  return (
    <div className="card nm-card">
      <div className="nm-top">
        <span className="pill pill-green">Live · Ndeshja e radhës</span>
        <span className="text-dim" style={{ fontSize: 13 }}>{dlong(match.kickoff)}</span>
      </div>
      <div className="nm-body">
        <div className="nm-team">
          <Crest team={match.home_team} code={match.home_code} size={56} round />
          <span className="nm">{match.home_team}</span>
        </div>
        <span className="nm-vs">vs</span>
        <div className="nm-team">
          <Crest team={match.away_team} code={match.away_code} size={56} round />
          <span className="nm">{match.away_team}</span>
        </div>
      </div>
      <div className="nm-count">{c.d !== '00' ? `${c.d}:` : ''}{c.h}:{c.m}:{c.s}</div>
      <div className="nm-foot">
        <Link to="/register" className="btn btn-primary block" style={{ marginTop: 16 }}>Parashiko këtë ndeshje</Link>
      </div>
    </div>
  );
}

export default function Home() {
  const home = useHomeData();
  const live = home.configured && !home.loading;
  const upcoming = live ? (home.upcoming || []).slice(0, 5) : [];

  return (
    <div className="home">
      <nav className="home-nav">
        <Link to="/" className="brand">
          <div className="t">KOSOVA KUP</div>
          <div className="s">World Cup 2026</div>
        </Link>
        <div className="links">
          <Link to="/fixtures">Ndeshjet</Link>
          <Link to="/grupet">Grupet</Link>
          <Link to="/renditja">Renditja</Link>
          <a href="#si-funksionon">Si funksionon</a>
        </div>
        <div className="cta">
          <Link to="/login" className="btn btn-outline sm">Identifikohu</Link>
          <Link to="/register" className="btn btn-primary sm">Regjistrohu</Link>
        </div>
      </nav>

      <div className="home-wrap">
        <section className="home-hero">
          <div>
            <div className="eyebrow">Liga Kombëtare e Parashikimeve</div>
            <h1>Parashiko Kupën e Botës. <span className="g">Bëhu kampion.</span></h1>
            <p>Bashkohu me mijëra tifozë kosovarë. Parashiko çdo ndeshje, fito pikë sipas saktësisë dhe ngjitu në krye të renditjes kombëtare.</p>
            <div className="ctas">
              <Link to="/register" className="btn btn-primary">Fillo falas <IconArrow size={16} /></Link>
              <Link to="/renditja" className="btn btn-outline">Shiko renditjen</Link>
            </div>
            <div className="home-stats">
              <div><div className="v text-green">{live ? home.counts.matches ?? 104 : 104}</div><div className="l">Ndeshje</div></div>
              <div><div className="v text-gold">{live ? home.counts.nations ?? 48 : 48}</div><div className="l">Kombëtare</div></div>
              <div><div className="v">{live ? (home.counts.patriots ?? 0).toLocaleString('en-US') : '—'}</div><div className="l">Lojtarë</div></div>
            </div>
          </div>
          <NextMatchCard match={live ? home.featured : null} nextKickoff={live ? home.nextKickoff : null} />
        </section>

        {upcoming.length > 0 && (
          <section className="home-section">
            <div className="row-between">
              <h2>Ndeshjet e Radhës</h2>
              <Link to="/fixtures" className="link-green">Të gjitha →</Link>
            </div>
            <div className="card">
              {upcoming.map((m) => (
                <Link key={m.id} to="/register" className="fx">
                  <span className="t">{t(m.kickoff)}</span>
                  <span className="tm h"><span className="nm">{m.home_team}</span><Crest team={m.home_team} code={m.home_code} /></span>
                  <span className="vs">vs</span>
                  <span className="tm"><Crest team={m.away_team} code={m.away_code} /><span className="nm">{m.away_team}</span></span>
                  <span className="chev"><IconArrow size={14} /></span>
                </Link>
              ))}
            </div>
          </section>
        )}

        <section className="home-section" id="si-funksionon">
          <div className="grid-2">
            <div>
              <h2>Si funksionon</h2>
              <p className="text-dim" style={{ margin: '8px 0 20px', maxWidth: 460 }}>
                Pa bastore, pa para — vetëm njohuria jote për futbollin kundër të gjithë Kosovës.
              </p>
              <div className="steps">
                {steps.map(([b, p], i) => (
                  <div className="st" key={b}>
                    <div className="n">{i + 1}</div>
                    <div className="tx"><b>{b}</b><p>{p}</p></div>
                  </div>
                ))}
              </div>
            </div>
            <div className="card pad">
              <div className="row-between" style={{ marginBottom: 6 }}>
                <h3 style={{ fontSize: 16 }}>Si fitohen pikët</h3>
                <span className="pill pill-mute">Eliminimet ×2 · Finalja ×3</span>
              </div>
              <div className="scoring-list">
                {scoring.map(([l, p]) => (
                  <div className="sr" key={l}><span>{l}</span><span className="pt">{p}</span></div>
                ))}
              </div>
              <Link to="/register" className="btn btn-primary block" style={{ marginTop: 18 }}>Krijo llogarinë falas</Link>
            </div>
          </div>
        </section>

        <footer className="home-foot">
          <div className="row-between">
            <span>© 2026 Kosova Kup · Të gjitha të drejtat e rezervuara.</span>
            <span style={{ display: 'flex', gap: 18 }}>
              <a href="#">Rregullat</a><a href="#">Privatësia</a><a href="#">Kontakt</a>
            </span>
          </div>
        </footer>
      </div>
    </div>
  );
}
