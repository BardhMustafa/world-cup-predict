import { Link } from 'react-router-dom';
import useHomeData from '../hooks/useHomeData.js';
import { useCountdownTo } from '../hooks/useCountdown.js';
import { useAuth } from '../context/AuthContext.jsx';
import Crest from '../components/Crest.jsx';
import PromoCard from '../components/PromoCard.jsx';
import { leaderboard as sampleLeaders } from '../data/leaderboard.js';
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

// One marquee tie, scored four ways. Beats a generic numbered "how it works".
const SCORE_EXAMPLE = {
  home: 'Argjentina', home_code: 'ARG',
  away: 'Brazili', away_code: 'BRA',
  finalH: 2, finalA: 1,
  ways: [
    { pred: '2–1', label: 'Rezultat i saktë', pts: '+10', tone: 'exact' },
    { pred: '3–2', label: 'Fitues + diferenca e golave', pts: '+5', tone: 'diff' },
    { pred: '1–0', label: 'Vetëm fituesin e gjete', pts: '+3', tone: 'win' },
    { pred: '0–2', label: 'Krejt anash', pts: '0', tone: 'miss' },
  ],
};

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

// Section label: a hand-set index + kicker, reused across the page so each
// band reads as a chapter rather than another identical stripe.
function Kicker({ n, children }) {
  return (
    <div className="hx-kicker">
      <span className="hx-num">{n}</span>
      <span className="hx-eyebrow">{children}</span>
    </div>
  );
}

function Matchroom({ home, upcoming, user }) {
  return (
    <section className="hx-band hx-matchroom" id="matchroom">
      <Kicker n="01">Tabela e ndeshjeve</Kicker>
      <div className="hx-mr-head">
        <h2>Ndeshja e radhës nuk pret askënd.</h2>
        <p>Dritarja për të parashikuar hapet 12 orë para bilbilit dhe mbyllet me të. Vendos rezultatin, e harro — pikët vijnë vetë.</p>
      </div>
      <div className="hx-mr-grid">
        <NextMatchCard match={home.featured} nextKickoff={home.nextKickoff} user={user} />
        <div className="hx-fixtures card">
          <div className="hx-fx-head">
            <span>Pas saj</span>
            <Link to="/fixtures" className="link-green">Kalendari i plotë →</Link>
          </div>
          {upcoming.map((m) => (
            <Link key={m.id} to={user ? '/fixtures' : '/register'} className="hx-fx">
              <span className="hx-fx-day">{dlong(m.kickoff)}</span>
              <span className="hx-fx-time">{t(m.kickoff)}</span>
              <span className="hx-fx-tie">
                <Crest team={m.home_team} code={m.home_code} size={22} round />
                <b>{m.home_code || m.home_team}</b>
                <i>v</i>
                <b>{m.away_code || m.away_team}</b>
                <Crest team={m.away_team} code={m.away_code} size={22} round />
              </span>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}

function Scoring({ user }) {
  const ex = SCORE_EXAMPLE;
  return (
    <section className="hx-band hx-scoring-band" id="si-funksionon">
      <Kicker n="02">Si shënohen pikët</Kicker>
      <div className="hx-scoring">
        <div className="hx-sc-grid">
        <div className="hx-sc-intro">
          <h2>Një ndeshje.<br />Katër mënyra për të shënuar.</h2>
          <p>Sa më afër rezultatit të vërtetë, aq më shumë pikë. Ja se si do të dukej një parashikim i vetëm kundër këtij rezultati final.</p>
          <div className="hx-sc-mult">
            <span className="pill pill-mute">Faza me eliminim ×2</span>
            <span className="pill pill-gold">Finalja ×3</span>
          </div>
          <Link to={user ? '/fixtures' : '/register'} className="btn btn-primary">
            {user ? 'Parashiko tash' : 'Hap llogarinë falas'} <IconArrow size={16} />
          </Link>
        </div>

        <div className="hx-sc-board card">
          <div className="hx-final">
            <span className="hx-final-tag">Rezultati final</span>
            <div className="hx-final-row">
              <span className="hx-final-team"><Crest team={ex.home} code={ex.home_code} size={28} round /> {ex.home}</span>
              <span className="hx-final-score">{ex.finalH}<i>–</i>{ex.finalA}</span>
              <span className="hx-final-team r">{ex.away} <Crest team={ex.away} code={ex.away_code} size={28} round /></span>
            </div>
          </div>
          <div className="hx-ways">
            {ex.ways.map((w) => (
              <div className={`hx-way hx-way-${w.tone}`} key={w.pred}>
                <span className="hx-way-pred">{w.pred}</span>
                <span className="hx-way-label">{w.label}</span>
                <span className="hx-way-pts">{w.pts}</span>
              </div>
            ))}
          </div>
        </div>
        </div>
      </div>
    </section>
  );
}

function Standings({ rows, user, live }) {
  return (
    <section className="hx-band hx-standings">
      <Kicker n="03">Renditja kombëtare</Kicker>
      <div className="hx-st-head">
        <h2>Kush po kryeson</h2>
        <Link to="/renditja" className="link-green">Tabela e plotë →</Link>
      </div>
      <div className="hx-st-list card">
        {rows.map((r, i) => (
          <div className={`hx-st-row${r.you ? ' me' : ''}`} key={r.name + i}>
            <span className="hx-st-pos">{String(i + 1).padStart(2, '0')}</span>
            <span className="hx-st-ini">{r.initials}</span>
            <span className="hx-st-name">
              {r.name}
              {r.city && <em>{r.city}</em>}
            </span>
            <span className="hx-st-acc">{r.acc}<i>saktësi</i></span>
            <span className="hx-st-pts">{r.points}</span>
          </div>
        ))}
        <Link to={user ? '/renditja' : '/register'} className="hx-st-cta">
          {live ? 'Hyr në garë dhe zër vendin tënd' : 'Bëhu pjesë e renditjes'} <IconArrow size={15} />
        </Link>
      </div>
    </section>
  );
}

export default function Home() {
  const home = useHomeData();
  const { user } = useAuth();
  const live = home.configured && !home.loading;
  const upcoming = live ? (home.upcoming || []).slice(0, 5) : [];

  // Real leaders when the DB is wired; otherwise the editorial sample so the
  // page never looks empty in a fresh/preview deploy.
  const realLeaders = (home.leaders || []).slice(0, 5).map((r) => ({
    name: r.full_name,
    initials: r.initials || r.full_name?.slice(0, 2).toUpperCase(),
    points: Number(String(r.points).replace(/,/g, '') || 0).toLocaleString('en-US'),
    acc: r.played ? `${Math.round((100 * ((r.exact_count || 0) + (r.correct_count || 0))) / r.played)}%` : '—',
    you: false,
  }));
  const fallbackLeaders = sampleLeaders.slice(0, 5).map((r) => ({
    name: r.name, initials: r.initials, city: r.city, points: r.points, acc: r.accuracy, you: r.tier === 'you',
  }));
  // Real leaderboard whenever the DB has players; the editorial sample only
  // stands in for a preview deploy with no Supabase wired up.
  const standings = live && realLeaders.length ? realLeaders : fallbackLeaders;

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
          <Matchroom home={home} upcoming={upcoming} user={user} />
        )}

        <Scoring user={user} />

        <PromoCard slot="home" />

        <Standings rows={standings} user={user} live={live} />

        <footer className="hx-foot">
          <div className="hx-foot-top">
            <div className="hx-foot-brand">
              <div className="t">KUPA E BOTËS <span>2026</span></div>
              <p>Liga kombëtare e parashikimeve. S'ka bastore, s'ka para në mes — vetëm ti kundër gjithë Kosovës.</p>
            </div>
            <div className="hx-foot-cols">
              <div>
                <span className="h">Loja</span>
                <Link to="/fixtures">Ndeshjet</Link>
                <Link to="/grupet">Grupet</Link>
                <Link to="/renditja">Renditja</Link>
                <Link to="/mvp">MVP</Link>
              </div>
              <div>
                <span className="h">Llogaria</span>
                <Link to="/register">Regjistrohu</Link>
                <Link to="/login">Identifikohu</Link>
                <Link to="/liga">Liga private</Link>
              </div>
            </div>
          </div>
          <div className="hx-foot-bot">
            <span>© 2026 Kupa e Botës · Ndërtuar në Prishtinë.</span>
            <span className="hx-foot-legal">
              <a href="#si-funksionon">Rregullat</a>
              <a href="#si-funksionon">Privatësia</a>
              <a href="#matchroom">Kontakt</a>
            </span>
          </div>
        </footer>
      </div>
    </div>
  );
}
