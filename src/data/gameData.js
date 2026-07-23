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
    conferenceSchools: ['kingsley', 'staldous', 'riverbend', 'gilaflats', 'cordwood'],
    home: {
      name: 'Sunset Shore',
      desc: 'Long holes, slick fairways, and a hard field. The least-forgiving track in the state.',
      pb9: -5,
    },
    team: 92,
    scout: 95,
    conf: 'Prep National League',
    champ: { name: 'Prep National Championship', course: { name: 'Sunset Shore', pb9: -5 } },
    tryout: { gir: 3, fair: 3, stp: -2, failStp: 2 },
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
    conferenceSchools: ['kingsley', 'staldous', 'riverbend', 'gilaflats', 'cordwood'],
    home: {
      name: 'Triple Snake',
      desc: 'A hard course with tough wind, fast greens, demanding pins, and a strong field.',
      pb9: -6,
    },
    team: 80,
    scout: 75,
    conf: 'Cathedral League',
    champ: { name: 'Cathedral League Championship', course: { name: 'Triple Snake', pb9: -6 } },
    tryout: { gir: 2, fair: 2, stp: -1, failStp: 3 },
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
    conferenceSchools: ['kingsley', 'staldous', 'riverbend', 'gilaflats', 'cordwood'],
    home: {
      name: 'Horseshoe Gorge',
      desc: 'Consistent winds and quick greens — an honest test that rewards a steady game.',
      pb9: -7,
    },
    team: 64,
    scout: 50,
    conf: 'Valley Conference',
    champ: { name: 'Valley Conference Championship', course: { name: 'Horseshoe Gorge', pb9: -7 } },
    tryout: { gir: 2, fair: 2, stp: 0 },
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
    conferenceSchools: ['kingsley', 'staldous', 'riverbend', 'gilaflats', 'cordwood'],
    home: {
      name: 'Monument Valley',
      desc: 'Breezy conditions with nasty rough and sand. Scores go low, so separating yourself is the challenge.',
      pb9: -7,
    },
    team: 48,
    scout: 28,
    conf: 'Desert League',
    champ: { name: 'Desert League Championship', course: { name: 'Monument Valley', pb9: -7 } },
    tryout: { gir: 1, fair: 1, stp: 1 },
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
    conferenceSchools: ['kingsley', 'staldous', 'riverbend', 'gilaflats', 'cordwood'],
    home: {
      name: 'Home Bay Links',
      desc: 'A coastal links with stiff easterly winds. Nobody expects much here — which is exactly why a big season gets noticed.',
      pb9: -8,
    },
    team: 32,
    scout: 12,
    conf: 'North Bay League',
    champ: { name: 'North Bay League Championship', course: { name: 'Home Bay Links', pb9: -8 } },
    tryout: { gir: 1, fair: 1, stp: 2 },
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

export const LEADS = {
  kingsley: ['Beau Kessler', 70],
  staldous: ['Ty Brennan', 66],
  riverbend: ['Sam Holloway', 64],
  gilaflats: ['Cody Behr', 60],
  cordwood: ['Marcus Bell', 58],
};

export const initialState = {
  screen: 'welcome',
  schoolId: null,
  tryStep: 0,
  tryEntries: [],
  tryVal: 2,
  tryScore: 0,
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
