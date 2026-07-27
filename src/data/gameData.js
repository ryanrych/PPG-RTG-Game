export const KHA = '#b8a860';

export const SCHOOLS = [
  {
    id: 'kingsley',
    name: 'Kingsley Prep',
    mascot: 'Royals',
    prestige: 5,
    risk: true,
    roster: 8,
    hat: '#ffffff',
    shirt: '#0b1f5e',
    apparelType: 'Hat',
    blurb: 'Old-money boarding-school golf factory. Scout-dense, brutal to crack.',
    home: {
      name: 'Sunset Shore',
      desc: 'Long holes, slick fairways, and a hard field. The least-forgiving track in the state.',
      pb9: -5,
    },
    team: 92,
    scout: 95,
    conf: 'Prep National League',
    champ: { name: 'Prep National Championship', course: { name: 'Sunset Shore', pb9: -5 } },
    tryout: { bar: -7, gir: 3, fair: 3, putt: 3, cutThreshold: 2 },
  },
  {
    id: 'staldous',
    name: 'St. Aldous Academy',
    mascot: 'Crusaders',
    prestige: 4,
    risk: true,
    roster: 7,
    hat: '#8a0f2e',
    shirt: '#a5102f',
    apparelType: 'Hat',
    blurb: "Strong program. You'll fight for a lineup spot; making the team isn't a lock.",
    home: {
      name: 'Triple Snake',
      desc: 'A hard course with tough wind, fast greens, demanding pins, and a strong field.',
      pb9: -6,
    },
    team: 80,
    scout: 75,
    conf: 'Cathedral League',
    champ: { name: 'Cathedral League Championship', course: { name: 'Triple Snake', pb9: -6 } },
    tryout: { bar: -6, gir: 2, fair: 2, putt: 2, cutThreshold: 3 },
  },
  {
    id: 'riverbend',
    name: 'Riverbend High',
    mascot: 'Rapids',
    prestige: 3,
    risk: false,
    roster: 6,
    hat: '#2f9e44',
    shirt: '#2f4f4f',
    apparelType: 'Visor',
    blurb: 'The balanced middle path. Earn your spot, moderate scouting.',
    home: {
      name: 'Horseshoe Gorge',
      desc: 'Consistent winds and quick greens — an honest test that rewards a steady game.',
      pb9: -7,
    },
    team: 64,
    scout: 50,
    conf: 'Valley Conference',
    champ: { name: 'Valley Conference Championship', course: { name: 'Horseshoe Gorge', pb9: -7 } },
    tryout: { bar: -5, gir: 2, fair: 2, putt: 2 },
  },
  {
    id: 'gilaflats',
    name: 'Gila Flats High',
    mascot: 'Monsters',
    prestige: 2,
    risk: false,
    roster: 5,
    hat: '#e57a1f',
    shirt: '#e5451f',
    apparelType: 'Hat',
    blurb: 'Easily make varsity, but scouts rarely visit. Earn eyes with numbers.',
    home: {
      name: 'Monument Valley',
      desc: 'Breezy conditions with nasty rough and sand. Scores go low, so separating yourself is the challenge.',
      pb9: -7,
    },
    team: 48,
    scout: 28,
    conf: 'Desert League',
    champ: { name: 'Desert League Championship', course: { name: 'Monument Valley', pb9: -7 } },
    tryout: { bar: -4, gir: 1, fair: 1, putt: 1 },
  },
  {
    id: 'cordwood',
    name: 'Cordwood Union High',
    mascot: 'Lumberjacks',
    prestige: 1,
    risk: false,
    roster: 5,
    hat: '#d4af37',
    shirt: '#d4af37',
    apparelType: 'Hat',
    blurb: "You're the best player day one. Nobody's watching until you force them to.",
    home: {
      name: 'Home Bay Links',
      desc: 'A coastal links with stiff easterly winds. Nobody expects much here — which is exactly why a big season gets noticed.',
      pb9: -8,
    },
    team: 32,
    scout: 12,
    conf: 'North Bay League',
    champ: { name: 'North Bay League Championship', course: { name: 'Home Bay Links', pb9: -8 } },
    tryout: { bar: -4, gir: 1, fair: 1, putt: 1 },
  },
];

export const MATE_NAMES = [
  'Jordan Pike',
  'Andre Wolfe',
  'Sean Delgado',
  'Kobe Ashworth',
  'Trey Lindqvist',
  'Marcus Yoon',
  'Eli Barnhart',
  'Rafe Coleman',
  'Devin Marsh',
  'Kai Ostrander',
];

export const OPP_NAMES = [
  'Chase Renfro',
  'Owen Marsh',
  'Luca Petrov',
  'Nate Sizemore',
  'Gabe Rowan',
  'Drew Halvorsen',
  'Miles Tran',
  'Cole Farkas',
  'Reid Vance',
  'Beau Tillman',
];

export const NINE_PARS = [4, 5, 3, 4, 4, 3, 5, 4, 4];

// Each playable school's fixed, self-contained conference: its 4 AI rival
// schools. Rivals never include another playable school. "coachRival" is
// flavor only (the coach hypes that matchup) — it carries no scoring weight.
// Rival matches are hosted at the rival's own course, which borrows the
// parent school's home pb9 as its difficulty baseline.
export const CONFERENCES = {
  kingsley: [
    { name: 'Ashford Hall', strength: 93, coachRival: true, golfer: 'Trent Ashworth', course: 'Cliffside Reach' },
    { name: 'Bellcrest Academy', strength: 88, golfer: 'Julian Ferris', course: 'Bellcrest Downs' },
    { name: 'Thornwood School', strength: 85, golfer: 'Grant Sutherland', course: 'Thornwood Glen' },
    { name: 'Vantage Prep', strength: 80, golfer: 'Miles Whitcombe', course: 'Vantage Ridge' },
  ],
  staldous: [
    { name: 'Cardinal Ridge', strength: 80, coachRival: true, golfer: 'Dominic Reyes', course: 'Cardinal Bluffs' },
    { name: 'Marlton Catholic', strength: 75, golfer: 'Nolan Vega', course: 'Marlton Chapel Course' },
    { name: 'Weston Day', strength: 72, golfer: 'Silas Voss', course: 'Weston Meadows' },
    { name: 'Harlow Central', strength: 67, golfer: 'Preston Doyle', course: 'Harlow Flats' },
  ],
  riverbend: [
    { name: 'Millbrook High', strength: 64, coachRival: true, golfer: 'Casey Nimmo', course: 'Millbrook Run' },
    { name: 'Cedar Valley', strength: 58, golfer: 'Boone Larkin', course: 'Cedar Hollow' },
    { name: 'Fox Hollow High', strength: 56, golfer: 'Jared Stroud', course: 'Fox Hollow Greens' },
    { name: 'Grant Township', strength: 51, golfer: 'Dez Okafor', course: 'Grant Township Municipal' },
  ],
  gilaflats: [
    { name: 'Dry Creek High', strength: 48, coachRival: true, golfer: 'Rowan Tessman', course: 'Dry Creek Wash' },
    { name: 'Rincon Mesa', strength: 43, golfer: 'Cruz Alderete', course: 'Rincon Mesa Links' },
    { name: 'Saguaro High', strength: 40, golfer: 'Wyatt Solano', course: 'Saguaro Flats' },
    { name: 'Ocotillo High', strength: 35, golfer: 'Ridge Calloway', course: 'Ocotillo Basin' },
  ],
  cordwood: [
    { name: 'Pinch Valley High', strength: 32, coachRival: true, golfer: 'Denny Osgood', course: 'Pinch Valley Municipal' },
    { name: 'Two Rivers High', strength: 27, golfer: 'Amos Kessler', course: 'Two Rivers Course' },
    { name: 'Millard County', strength: 24, golfer: 'Tobin Rourke', course: 'Millard County Links' },
    { name: 'Dunmore High', strength: 19, golfer: 'Silas Pruitt', course: 'Dunmore Muni' },
  ],
};

// Derives a rival golfer's shot consistency from their strength rating so
// the whole rival roster is driven by the single strength number.
export function rivalConsistency(strength) {
  return Math.round(Math.max(35, Math.min(95, 50 + strength * 0.25)));
}

export const initialState = {
  screen: 'welcome',
  schoolId: null,
  tryStep: 0,
  tryEntries: [],
  tryHoleIndex: 0,
  tryHoleStrokes: NINE_PARS[0],
  tryHoleHit: false,
  tryHoleAcc: [],
  tryPhase: 'brief',
  tryResult: null,
  spot: null,
  teammates: [],
  hubTab: 'schedule',
  events: [],
  eventIndex: 0,
  exposureRaw: 0,
  ev: null,
  curStrokes: 4,
  matchSummary: null,
  pendingScreen: null,
  recruitPhase: 'board',
  recruitPinnedIds: [],
  recruitOffers: null,
  recruitSort: 'prestige',
  recruitSelectedId: null,
  recruitWalkOnQuery: '',
  committedTeam: null,
  saveId: null,
  playerName: '',
  nameInput: '',
  saves: [],
};

export function rng(seed) {
  let a = seed >>> 0;
  return function () {
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = t + Math.imul(t ^ (t >>> 7), 61 | t) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export function gauss(r) {
  let u = 0;
  let v = 0;
  while (!u) u = r();
  while (!v) v = r();
  return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v);
}

export function sigmaFor(cons) {
  const SIGMA_WILD = 2.5;
  const SIGMA_STEADY = 1.5;
  return SIGMA_WILD + (SIGMA_STEADY - SIGMA_WILD) * (cons / 100);
}

export function expected9(pb, str) {
  return pb + 2.5 + 7 * (1 - str / 100);
}

export function score9(pb, str, cons, r) {
  const e = expected9(pb, str);
  const a = Math.round(e + gauss(r) * sigmaFor(cons));
  return Math.max(a, pb);
}

export function hash(str) {
  let h = 2166136261;
  for (let i = 0; i < str.length; i += 1) {
    h ^= str.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

export function distribute(totalToPar, pars, r) {
  const d = pars.map(() => 0);
  let rem = totalToPar;
  let g = 0;
  while (rem !== 0 && g++ < 800) {
    const i = Math.floor(r() * pars.length);
    if (rem < 0) {
      if (d[i] > -2) { d[i] -= 1; rem += 1; }
    } else if (d[i] < 3) {
      d[i] += 1; rem -= 1;
    }
  }
  return pars.map((p, i) => p + d[i]);
}

// Point value of a single challenge, keyed by (count - target). Meeting the
// target exactly is always worth +1; there is no zero. Tune here to change
// how much a challenge margin swings the starting spot.
export const CHALLENGE_ADJUSTMENT_SCALE = {
  '-3': -3,
  '-2': -2,
  '-1': -1,
  '0': 1,
  '1': 2,
  '2': 3,
};

export function challengeAdjustment(count, target) {
  const diff = Math.max(-3, Math.min(2, count - target));
  return CHALLENGE_ADJUSTMENT_SCALE[String(diff)];
}

export function rosterMiddle(roster) {
  return (roster + 1) / 2;
}

// rank_score of 0 lands on the middle of the roster; each +1 moves one spot
// toward varsity-1 (top), each -1 moves one spot toward the bottom.
export function spotFromRankScore(rankScore, roster) {
  const spot = Math.round(rosterMiddle(roster) - rankScore);
  return Math.max(1, Math.min(roster, spot));
}

// How far a single meet can move the player up or down the depth chart.
export const DEPTH_CHART_MOVE_CLAMP = 2;

// Where each teammate currently sits on the depth chart: teammates fill the
// roster spots around the player's own spot in strength order (highest
// strength gets the best open spot). Returns an array aligned with
// `teammates` — positions[i] is teammates[i]'s current 1-indexed spot.
export function depthChartSeeding(teammates, spot, roster) {
  const order = teammates.map((_, index) => index).sort((a, b) => teammates[b].str - teammates[a].str);
  const positions = new Array(teammates.length);
  let cursor = 0;
  for (let pos = 1; pos <= roster; pos += 1) {
    if (pos === spot) continue;
    positions[order[cursor]] = pos;
    cursor += 1;
  }
  return positions;
}

export function stars(value) {
  return '★★★★★☆☆☆☆☆'.slice(5 - value, 10 - value);
}

export function pbLabel(pb) {
  if (pb < 0) return String(pb);
  return pb === 0 ? 'E' : `+${pb}`;
}

export function toPar(value) {
  if (value < 0) return String(value);
  return value === 0 ? 'E' : `+${value}`;
}

export function initials(name) {
  return name
    .split(' ')
    .map((w) => w[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();
}

export function ord(n) {
  const s = ['th', 'st', 'nd', 'rd'];
  const v = n % 100;
  return n + (s[(v - 20) % 10] || s[v] || s[0]);
}
