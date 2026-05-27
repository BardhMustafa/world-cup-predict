import Button from './Button.jsx';
import StadiumEngraving from './StadiumEngraving.jsx';

const defaultStats = [
  { v: '64', l: 'Matches to Forecast' },
  { v: '32', l: 'Nations in the Draw' },
  { v: '12,447', l: 'Patriots Enrolled' },
];

export default function Hero({ stats = defaultStats }) {
  return (
    <section className="hero">
      <div className="hero-text">
        <div className="kicker">No. 12 · Matchday One Edition</div>
        <h2 className="hero-headline">
          The World <em>Cup</em>
          <br />
          Prediction
          <br />
          League<span style={{ color: 'var(--burgundy)' }}>.</span>
        </h2>
        <p className="hero-deck">
          Predict every match. Climb the table.
          <br />
          Become the champion of all Kosovo.
        </p>

        <div className="hero-byline">
          <span>
            <em>By</em>{' '}
            <strong style={{ fontFamily: 'var(--display)' }}>Arben Kelmendi</strong> · Sports Editor
          </span>
          <span>Filed 06:00 hrs · Filed under the Cup</span>
        </div>

        <p className="hero-lede">
          Sixty-four matches. Thirty-two nations. One trophy that has glimmered in the imagination of
          every Kosovar boy and girl since the day the radio first crackled with goals from Wembley in
          '66. This summer, the World Cup returns &mdash; and with it, the oldest argument in our cafés:
          who knows their football best? <em>The Prediction Post</em> stages its first national league of
          pundits. No bookmaker. No stakes. Only the cold honesty of a final scoreline against your
          morning's guess, played out before every neighbour, in every town from Mitrovicë to Gjakovë.
          Open the paper each morning, mark your card, lock it in before kick-off. Whoever knows the game
          best is rewarded. Whoever guesses cleverest crowns themselves a small champion. By the time the
          final whistle blows in MetLife, only one shall remain at the top of the table.
        </p>

        <div className="hero-ctas">
          <Button variant="ink" to="/register" withArrow>
            Join the League
          </Button>
          <Button variant="out" to="/leaderboard">View the Table</Button>
        </div>

        <div className="hero-stats">
          {stats.map(({ v, l }) => (
            <div key={l}>
              <div className="v">{v}</div>
              <div className="l">{l}</div>
            </div>
          ))}
        </div>
      </div>

      <div className="hero-art">
        <div className="hero-art-frame">
          <StadiumEngraving />
          <div className="hero-caption">
            <em>Plate 1.</em> &mdash; A general view of the modern arena, drawn from the upper stand; the
            lamps lit early for evening kick-off. Engraving by our staff artist.
          </div>
        </div>
      </div>
    </section>
  );
}
