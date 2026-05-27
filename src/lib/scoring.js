// Display-only mirror of the Postgres scoring rules (supabase/migrations/
// 0002_functions.sql). The database is the source of truth for awarded
// points — this is used to *preview* what a prediction would earn and to
// label finished predictions in the UI.
export const SCORING = {
  exact: 10,
  goal_diff: 5,
  outcome: 3,
  missed: 0,
};

export const OUTCOME_LABELS = {
  exact: 'Exact score',
  goal_diff: 'Outcome & goal difference',
  outcome: 'Correct outcome',
  missed: 'Missed',
};

const sign = (n) => (n > 0 ? 1 : n < 0 ? -1 : 0);

// Returns { outcome, base, points } for a prediction against a final score.
export function scorePrediction(homePred, awayPred, homeScore, awayScore, multiplier = 1) {
  if (homeScore == null || awayScore == null) return { outcome: null, base: 0, points: null };

  const predDiff = homePred - awayPred;
  const realDiff = homeScore - awayScore;

  let outcome;
  if (homePred === homeScore && awayPred === awayScore) outcome = 'exact';
  else if (sign(predDiff) === sign(realDiff) && predDiff === realDiff) outcome = 'goal_diff';
  else if (sign(predDiff) === sign(realDiff)) outcome = 'outcome';
  else outcome = 'missed';

  const base = SCORING[outcome];
  return { outcome, base, points: base * multiplier };
}

export const stageLabels = {
  group: 'Group Stage',
  round_of_32: 'Round of 32',
  round_of_16: 'Round of 16',
  quarter_final: 'Quarter-final',
  semi_final: 'Semi-final',
  third_place: 'Third-place Play-off',
  final: 'The Final',
};
