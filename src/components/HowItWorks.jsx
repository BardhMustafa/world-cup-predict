import SectionHeader from './SectionHeader.jsx';
import Button from './Button.jsx';

const scoring = [
  { label: 'Exact final score', pts: '+ 10 pts' },
  { label: 'Outcome & goal difference', pts: '+ 5 pts' },
  { label: 'Correct outcome only', pts: '+ 3 pts' },
  { label: 'Wrong outcome', pts: '0 pts', muted: true },
];

const steps = [
  {
    n: '1.',
    title: 'Register your name',
    body: 'Enrolment is free and takes scarcely a minute. We ask only for an electronic mail address, a chosen password, and your Kosovo identification number — the last for one-time verification, that we may guarantee one entry per patriot.',
  },
  {
    n: '2.',
    title: 'File your forecasts',
    body: "Each day, the morning edition publishes the day's fixtures with score boxes by their side. Mark a score for each match before kick-off. After the first whistle, the entry is sealed in the ledger and cannot be amended. Honesty is enforced not by us, but by the clock.",
  },
  {
    n: '3.',
    title: 'Earn your points',
    body: 'At full-time, points are awarded as set out in the scoring card. An exact scoreline is the highest honour the Post bestows. A close miss earns its share. A wrong call earns the silent shame of the table.',
  },
  {
    n: '4.',
    title: 'Climb the table',
    body: 'The Patriots’ Table is updated hourly. Filter to your city, to your friends, or compete against the whole of Kosovo. At the final whistle of the Final, one patriot shall be crowned the champion — their name printed in the morning edition, their photograph on the wall of every café from Prishtinë to Prizren.',
  },
];

export default function HowItWorks() {
  return (
    <section>
      <SectionHeader
        title={
          <>
            How the <em>League</em> Works
          </>
        }
        meta={
          <>
            An explainer in four parts
            <br />
            For the first-time entrant
          </>
        }
      />

      <div className="howto">
        <div className="howto-side">
          <h3>
            A Game of <em>Conviction.</em> Not Chance.
          </h3>
          <div className="byline">
            By the Editorial Desk &middot; 14 June MMXXVI
            <br />
            With contributions from the Statistics Bureau
          </div>

          <div className="scoring">
            <div className="label">The Scoring Card</div>
            {scoring.map(({ label, pts, muted }) => (
              <div className="scoring-row" key={label}>
                <span>{label}</span>
                <span className="pts" style={muted ? { color: 'var(--ink-muted)' } : undefined}>
                  {pts}
                </span>
              </div>
            ))}
          </div>

          <p style={{ fontFamily: 'var(--label)', fontStyle: 'italic', fontSize: 13, color: 'var(--ink-soft)' }}>
            Knock-out stage matches carry double weight. The Final, triple.
          </p>
        </div>

        <div className="howto-article">
          <p>
            <strong style={{ fontFamily: 'var(--display)', fontWeight: 900 }}>EVERY YEAR</strong> in the
            season of the Cup, a peculiar thing happens to grown men in cafés: they become football
            pundits. They argue. They draw lines on napkins. They lock in scorelines that, by the second
            goal of the match, are immortal &mdash; one way or the other. <em>The Prediction Post</em> is
            an attempt to enshrine that ritual in a single national league.
          </p>

          {steps.map(({ n, title, body }) => (
            <div key={n}>
              <h4>
                <span className="step-num">{n}</span>
                {title}
              </h4>
              <p>{body}</p>
            </div>
          ))}

          <div className="rule-orn">&dagger;</div>

          <p>
            &mdash; <em>And so,</em> the Prediction Post invites you to take up your pen, sharpen your
            tongue, and make your voice heard at the great festival of the summer.
          </p>
        </div>
      </div>

      <div style={{ textAlign: 'center', margin: '30px 0 20px' }}>
        <Button variant="ink" to="/register" withArrow style={{ fontSize: 15, padding: '14px 26px 12px' }}>
          Enrol Now &mdash; It is Free
        </Button>
      </div>
    </section>
  );
}
