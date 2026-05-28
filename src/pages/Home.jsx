import { Link } from 'react-router-dom';
import useHomeData from '../hooks/useHomeData.js';
import { useCountdownTo } from '../hooks/useCountdown.js';
import { useAuth } from '../context/AuthContext.jsx';
import Crest from '../components/Crest.jsx';
import { IconArrow } from '../components/ui/icons.jsx';

function HeroImages() {
  return (
    <div className="hero-backdrop" aria-hidden="true">
      <img src="/trophy.png" className="hero-img hero-trophy" alt="" draggable="false" />
      {/* gradient vignette so images fade into the dark bg */}
      <div className="hero-vignette" />
    </div>
  );
}

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

function NextMatchCard({ match, nextKickoff, user }) {
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
        <Link to={user ? '/fixtures' : '/register'} className="btn btn-primary block" style={{ marginTop: 16 }}>Parashiko këtë ndeshje</Link>
      </div>
    </div>
  );
}

function PrizePodium({ user }) {
  return (
    <div className="hero-podium">
      <div className="podium-eyebrow">Çmimi i Kampionatit</div>
      <div className="podium-headline">
        <span className="total">300€</span>
        <span className="sub">në çmime totale · 3 vendet e para</span>
      </div>
      <div className="podium-stage">
        <div className="podium-col p2">
          <div className="p-amount">100€</div>
          <div className="p-bar"><span className="p-rank">2</span></div>
        </div>
        <div className="podium-col p1">
          <div className="p-amount">150€</div>
          <div className="p-bar"><span className="p-rank">1</span></div>
        </div>
        <div className="podium-col p3">
          <div className="p-amount">50€</div>
          <div className="p-bar"><span className="p-rank">3</span></div>
        </div>
      </div>
      <div className="podium-floor" />
      <Link to={user ? '/ballina' : '/register'} className="btn btn-primary">Garoj për çmimin <IconArrow size={15} /></Link>
    </div>
  );
}

export default function Home() {
  const home = useHomeData();
  const { user } = useAuth();
  const live = home.configured && !home.loading;
  const upcoming = live ? (home.upcoming || []).slice(0, 5) : [];

  return (
    <div className="home">
      <nav className="home-nav">
        <Link to="/" className="brand">
          <div className="t">KUPA E BOTËS</div>
          <div className="s">2026</div>
        </Link>
        <div className="links">
          <Link to="/fixtures">Ndeshjet</Link>
          <Link to="/grupet">Grupet</Link>
          <Link to="/renditja">Renditja</Link>
          <a href="#si-funksionon">Si funksionon</a>
        </div>
        <div className="cta">
          {user ? (
            <Link to="/ballina" className="btn btn-primary sm">Paneli im <IconArrow size={14} /></Link>
          ) : (
            <>
              <Link to="/login" className="btn btn-outline sm">Identifikohu</Link>
              <Link to="/register" className="btn btn-primary sm">Regjistrohu</Link>
            </>
          )}
        </div>
      </nav>

      {/* Hero is full-width — backdrop bleeds edge to edge */}
      <section className="home-hero">
        <HeroImages />
        <div className="hero-grid">
          <div style={{ position: 'relative', zIndex: 1 }}>
            <div className="eyebrow">Liga Kombëtare e Parashikimeve</div>
            <h1>Parashiko Kupën e Botës. <span className="g">Bëhu kampion.</span></h1>
            <p>Bashkohu me mijëra tifozë kosovarë. Parashiko çdo ndeshje, fito pikë sipas saktësisë dhe ngjitu në krye të renditjes kombëtare.</p>
            <div className="ctas">
              <Link to={user ? '/fixtures' : '/register'} className="btn btn-primary">
                {user ? 'Parashiko tash' : 'Fillo falas'} <IconArrow size={16} />
              </Link>
              <Link to="/renditja" className="btn btn-outline">Shiko renditjen</Link>
            </div>
            <div className="home-stats">
              <div><div className="v text-green">{live ? home.counts.matches ?? 104 : 104}</div><div className="l">Ndeshje</div></div>
              <div><div className="v text-gold">{live ? home.counts.nations ?? 48 : 48}</div><div className="l">Kombëtare</div></div>
              <div><div className="v">{live ? (home.counts.patriots ?? 0).toLocaleString('en-US') : '—'}</div><div className="l">Lojtarë</div></div>
            </div>
          </div>
          <div style={{ position: 'relative', zIndex: 1 }}>
            <PrizePodium user={user} />
          </div>
        </div>
      </section>

      <div className="home-wrap">

        {live && home.featured && (
          <section className="home-section">
            <NextMatchCard match={home.featured} nextKickoff={home.nextKickoff} user={user} />
          </section>
        )}

        {upcoming.length > 0 && (
          <section className="home-section">
            <div className="row-between">
              <h2>Ndeshjet e Radhës</h2>
              <Link to="/fixtures" className="link-green">Të gjitha →</Link>
            </div>
            <div className="card">
              {upcoming.map((m) => (
                <Link key={m.id} to={user ? '/fixtures' : '/register'} className="fx">
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
              <Link to={user ? '/fixtures' : '/register'} className="btn btn-primary block" style={{ marginTop: 18 }}>
                {user ? 'Parashiko tash' : 'Krijo llogarinë falas'}
              </Link>
            </div>
          </div>
        </section>

        <footer className="home-foot">
          <div className="row-between">
            <span>© 2026 Kupa e Botës · Të gjitha të drejtat e rezervuara.</span>
            <span style={{ display: 'flex', gap: 18 }}>
              <a href="#">Rregullat</a><a href="#">Privatësia</a><a href="#">Kontakt</a>
            </span>
          </div>
        </footer>
      </div>
    </div>
  );
}
