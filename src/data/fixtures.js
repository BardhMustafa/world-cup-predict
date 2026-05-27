// To-day's fixtures, grouped by matchday. Each match carries its two teams,
// kick-off time, and the reader's forecast state:
//   'forecast' — a prediction has been filled in (editable)
//   'open'     — no prediction yet (editable)
//   'locked'   — match is live, the entry is sealed (read-only)
export const fixtures = [
  {
    day: 'Sat.',
    date: 14,
    dateSuffix: 'th',
    month: 'June',
    matches: [
      {
        id: 'kos-alb',
        time: '22:00',
        home: 'Kosovo',
        away: 'Albania',
        state: 'forecast',
        prediction: { home: '2', away: '1' },
        featured: true,
      },
      {
        id: 'fra-aus',
        time: '19:00',
        home: 'France',
        away: 'Australia',
        state: 'open',
        prediction: { home: '', away: '' },
      },
      {
        id: 'eng-usa',
        time: '16:00',
        home: 'England',
        away: 'United States',
        state: 'forecast',
        prediction: { home: '2', away: '0' },
      },
      {
        id: 'ger-pol',
        time: '13:00',
        home: 'Germany',
        away: 'Poland',
        state: 'locked',
        prediction: { home: '2', away: '2' },
      },
    ],
  },
  {
    day: 'Sun.',
    date: 15,
    dateSuffix: 'th',
    month: 'June',
    matches: [
      {
        id: 'arg-mex',
        time: '20:00',
        home: 'Argentina',
        away: 'Mexico',
        state: 'forecast',
        prediction: { home: '2', away: '1' },
      },
      {
        id: 'bra-srb',
        time: '23:00',
        home: 'Brazil',
        away: 'Serbia',
        state: 'open',
        prediction: { home: '', away: '' },
      },
      {
        id: 'esp-mar',
        time: '17:00',
        home: 'Spain',
        away: 'Morocco',
        state: 'open',
        prediction: { home: '', away: '' },
      },
    ],
  },
];
