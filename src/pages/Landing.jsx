import Masthead from '../components/Masthead.jsx';
import Hero from '../components/Hero.jsx';
import Fixtures from '../components/Fixtures.jsx';
import LeagueTable from '../components/LeagueTable.jsx';
import FeaturedMatch from '../components/FeaturedMatch.jsx';
import HowItWorks from '../components/HowItWorks.jsx';
import Footer from '../components/Footer.jsx';
import MobileNav from '../components/MobileNav.jsx';
import useHomeData from '../hooks/useHomeData.js';

// The editorial front page — a newspaper on World Cup morning. Pulls live data
// from Supabase when configured; otherwise renders the editorial sample.
export default function Landing() {
  const home = useHomeData();
  const live = home.configured && !home.loading;

  // Hero headline counts, real when available.
  const stats = live
    ? [
        { v: String(home.counts.matches ?? 0), l: 'Matches to Forecast' },
        { v: String(home.counts.nations ?? 0), l: 'Nations in the Draw' },
        { v: (home.counts.patriots ?? 0).toLocaleString('en-GB'), l: 'Patriots Enrolled' },
      ]
    : undefined;

  return (
    <>
      <div className="paper">
        <Masthead enrolled={live ? home.counts.patriots : undefined} />
        <Hero stats={stats} />
        <Fixtures
          days={live ? home.days : undefined}
          nextKickoff={live ? home.nextKickoff : undefined}
          featured={live ? home.featured : undefined}
        />
        <LeagueTable
          rows={live ? home.leaders : undefined}
          patriots={live ? home.counts.patriots : undefined}
        />
        <FeaturedMatch match={live ? home.featured : undefined} />
        <HowItWorks />
        <Footer />
      </div>
      <MobileNav />
    </>
  );
}
