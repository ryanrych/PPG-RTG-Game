// College career season logic: turns a committed college (from recruiting.js)
// into a real schedule (tournaments.js) plus a simulated teammate/opponent
// field, reusing the same scoring engine and depth-chart math as the high
// school career. Pure functions — no React, no screen state.
//
// Known simplification: the source data has no per-team schedules (only who
// *hosts* each event) and no course difficulty ratings, so: the schedule is
// [home tournament if we can match one] + [conference championship if we can
// find one] + enough random Stroke Play events to reach SEASON_LENGTH: and
// course difficulty is derived from the committed team's own strength rather
// than the real course. Good enough to play; easy to replace piece by piece
// as better data shows up.
import { hash, rng, gauss, MATE_NAMES, OPP_NAMES, NINE_PARS } from './gameData';
import { TOURNAMENTS } from './tournaments';
import { COLLEGES } from './recruiting';

export const SEASON_LENGTH = 6;
export const ROSTER_SIZE = 5; // standard NCAA counting lineup
export const FIELD_SIZE = 10; // simulated opponent golfers per event

// --- Between-round practice -------------------------------------------------
// A 3-hole challenge between tournaments, reusing the exact three high
// school tryout challenge types (GIR / fairways / 2-putts-or-fewer). Which
// one you get is random per gap. Sim gives a flat, un-rolled "average"
// result (met the target exactly) rather than a random one.
export const PRACTICE_TYPES = ['gir', 'fair', 'putt'];
export const PRACTICE_TARGET = 2; // of 3 holes, to clear the challenge
export const PRACTICE_PARS = NINE_PARS.slice(0, 3);
export const PRACTICE_MOVE_CLAMP = 1; // smaller stakes than a full tournament

export function generatePracticeChallenge(seedKey) {
  const roll = rng(hash(seedKey));
  const type = PRACTICE_TYPES[Math.floor(roll() * PRACTICE_TYPES.length)];
  return { type, target: PRACTICE_TARGET };
}

// A handful of conference names in rankings.csv don't literally appear in
// the championship tournament names (abbreviations, shortenings) — map them.
const CONFERENCE_ALIASES = {
  ASUN: ['Atlantic Sun'],
  'Coastal Athletic': ['CAA'],
  'Metro Atlantic': ['MAAC'],
  'Ohio Valley': ['OVC'],
  Southern: ['SoCon'],
  Northeast: ['NEC'],
};

function normalizeTeamName(name) {
  return name
    .toLowerCase()
    .replace(/&/g, ' and ')
    .replace(/[().']/g, '')
    .replace(/\bst\.?\b/g, 'saint')
    .replace(/\b(university of|university|college of|college|the)\b/g, ' ')
    .replace(/[^a-z0-9]+/g, ' ')
    .trim()
    .replace(/\s+/g, ' ');
}

const TOURNAMENTS_BY_HOST = new Map();
TOURNAMENTS.forEach((tournament) => {
  if (!tournament.host) return;
  const key = normalizeTeamName(tournament.host);
  if (!TOURNAMENTS_BY_HOST.has(key)) TOURNAMENTS_BY_HOST.set(key, []);
  TOURNAMENTS_BY_HOST.get(key).push(tournament);
});

// Only an exact normalized-name match counts, to avoid e.g. host "Iowa"
// matching "Iowa State" — missing a home event is fine, a wrong one isn't.
export function findHomeTournament(collegeName) {
  const matches = TOURNAMENTS_BY_HOST.get(normalizeTeamName(collegeName));
  if (!matches || !matches.length) return null;
  return matches.find((tournament) => tournament.format === 'Stroke Play') || matches[0];
}

// Resolves a tournament's host back to its rankings.csv entry (for
// conference + tier) — same exact-normalized-name matching as above.
const COLLEGE_BY_NAME_KEY = new Map();
COLLEGES.forEach((college) => {
  COLLEGE_BY_NAME_KEY.set(normalizeTeamName(college.name), college);
});

function resolveHostCollege(hostName) {
  if (!hostName) return null;
  return COLLEGE_BY_NAME_KEY.get(normalizeTeamName(hostName)) || null;
}

const STATE_ALIASES = {
  alabama: 'AL', arizona: 'AZ', arkansas: 'AR', california: 'CA', colorado: 'CO',
  connecticut: 'CT', delaware: 'DE', florida: 'FL', georgia: 'GA', hawaii: 'HI',
  idaho: 'ID', illinois: 'IL', indiana: 'IN', iowa: 'IA', kansas: 'KS',
  kentucky: 'KY', louisiana: 'LA', maine: 'ME', maryland: 'MD', massachusetts: 'MA',
  michigan: 'MI', minnesota: 'MN', mississippi: 'MS', missouri: 'MO', montana: 'MT',
  nebraska: 'NE', nevada: 'NV', 'new hampshire': 'NH', 'new jersey': 'NJ', 'new mexico': 'NM',
  'new york': 'NY', 'north carolina': 'NC', 'north dakota': 'ND', ohio: 'OH', oklahoma: 'OK',
  oregon: 'OR', pennsylvania: 'PA', 'rhode island': 'RI', 'south carolina': 'SC', 'south dakota': 'SD',
  tennessee: 'TN', texas: 'TX', utah: 'UT', vermont: 'VT', virginia: 'VA',
  washington: 'WA', 'west virginia': 'WV', wisconsin: 'WI', wyoming: 'WY',
};

// "Litchfield Park, AZ" -> "AZ", "Carlsbad, California" -> "CA". Locations
// outside the US (Puerto Rico, Ontario, Scotland, Japan, ...) fall through
// as their own uppercased string, which just won't match any US state.
function extractRegion(location) {
  if (!location) return null;
  const parts = location.split(',');
  if (parts.length < 2) return null;
  const raw = parts[parts.length - 1].trim().toLowerCase();
  return STATE_ALIASES[raw] || raw.toUpperCase();
}

// A team's "home" region, inferred from its own hosted tournament's
// location. Teams without a matched home tournament (most of them) just
// don't get a location signal — conference match and tier distance still
// apply on their own.
function inferHomeRegion(college) {
  const home = findHomeTournament(college.name);
  return home ? extractRegion(home.location) : null;
}

// Hyphens are removed (not turned into spaces) before matching so "Mid-
// American" merges into one word and can't satisfy a "\bAmerican\b" search
// meant for the (unrelated) American Athletic Conference — plain substring
// matching was also catching "CAA" inside "NCAA", which \b prevents too.
function normalizeForMatch(str) {
  return str.toLowerCase().replace(/-/g, '');
}

function escapeRegExp(str) {
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

export function findConferenceChampionship(confName) {
  if (!confName) return null;
  const keys = [confName, ...(CONFERENCE_ALIASES[confName] || [])].map((key) => normalizeForMatch(key));
  const candidates = TOURNAMENTS.filter((tournament) => {
    if (!/championship/i.test(tournament.name)) return false;
    const name = normalizeForMatch(tournament.name);
    return keys.some((key) => new RegExp(`\\b${escapeRegExp(key)}\\b`).test(name));
  });
  if (!candidates.length) return null;
  return candidates.find((tournament) => tournament.format === 'Stroke Play') || candidates[0];
}

// Picks `count` items from `entries` (each { item, weight }) without
// replacement, weighted-random — higher weight means more likely, not
// guaranteed. Draining a fixed top-N by weight would make the schedule
// deterministic; this keeps it random within the same bias.
function weightedSampleWithoutReplacement(entries, count, roll) {
  const pool = entries.slice();
  const picked = [];
  while (picked.length < count && pool.length) {
    const total = pool.reduce((sum, entry) => sum + entry.weight, 0);
    if (total <= 0) {
      pool.splice(Math.floor(roll() * pool.length), 1);
      continue;
    }
    let r = roll() * total;
    let index = 0;
    while (index < pool.length - 1 && r > pool[index].weight) {
      r -= pool[index].weight;
      index += 1;
    }
    picked.push(pool.splice(index, 1)[0].item);
  }
  return picked;
}

// Per-college schedule: home event (if found) + conference championship (if
// found) + enough Stroke Play events to reach SEASON_LENGTH, reseeded every
// season so the fill events vary year to year rather than repeating.
//
// The fill events are weighted-random rather than a flat draw from the whole
// calendar or a fixed top-N: tournaments hosted by a same-conference or
// same-region (state) program are drawn from far more often than everything
// else, and within each group, tournaments hosted by a program close to
// this team's own national tier (prestigeRank) are weighted higher than a
// distant mismatch — matching how real non-conference schedules cluster
// (regional rivals, similarly-competitive programs) while still giving each
// season some real variety, even though we don't have the actual per-team
// schedules to draw from directly.
export function buildCollegeSchedule(college, seasonYear = 1) {
  const roll = rng(hash(`${college.id}-college-schedule-${seasonYear}`));
  const usedIds = new Set();
  const schedule = [];

  const home = findHomeTournament(college.name);
  if (home) {
    schedule.push(home);
    usedIds.add(home.id);
  }

  const champ = findConferenceChampionship(college.conf);
  if (champ) usedIds.add(champ.id);

  const homeRegion = inferHomeRegion(college);
  const pool = TOURNAMENTS.filter((tournament) => tournament.format === 'Stroke Play' && tournament.course && !usedIds.has(tournament.id));

  const scored = pool.map((tournament) => {
    const hostCollege = resolveHostCollege(tournament.host);
    const sameConf = !!hostCollege && hostCollege.conf === college.conf;
    const sameRegion = !!homeRegion && extractRegion(tournament.location) === homeRegion;
    const tierDistance = hostCollege ? Math.abs(hostCollege.prestigeRank - college.prestigeRank) : null;
    // Closer tier -> weight nearer 1; unknown-tier hosts (unlisted/blank)
    // get a small flat weight so they're a rare pick, not an impossible one.
    const weight = tierDistance === null ? 0.05 : 1 / (1 + tierDistance * 0.15);
    return { item: tournament, weight, affinity: sameConf || sameRegion ? 0 : 1 };
  });

  const fillCount = SEASON_LENGTH - schedule.length - (champ ? 1 : 0);
  const primary = scored.filter((entry) => entry.affinity === 0);
  const fallback = scored.filter((entry) => entry.affinity === 1);

  let picks = weightedSampleWithoutReplacement(primary, fillCount, roll);
  if (picks.length < fillCount) {
    picks = picks.concat(weightedSampleWithoutReplacement(fallback, fillCount - picks.length, roll));
  }
  schedule.push(...picks);
  if (champ) schedule.push(champ);

  return schedule;
}

// Achievable ceiling for a college round, anchored to the team's own
// strength (0-100) since we don't have real per-course difficulty data.
// Elite programs play tighter setups and shoot lower; weaker ones see more
// forgiving par. Mirrors the shape of PRESTIGE_DIFFICULTY in gameData.js.
export function collegeCoursePb9(strength) {
  return Math.round(-6 - (strength / 100) * 8);
}

// Teammates start staggered across all four class years (one per year, since
// the roster is 4 teammates deep) so the very first season already has a
// senior a year from graduating, not a roster that turns over all at once.
export function generateCollegeTeammates(college, rosterSize = ROSTER_SIZE) {
  const roll = rng(hash(`${college.id}-college-teammates`));
  const mates = [];
  for (let k = 0; k < rosterSize - 1; k += 1) {
    const str = Math.max(30, Math.min(99, Math.round(college.strength + gauss(roll) * 8)));
    const cons = Math.max(35, Math.min(95, Math.round(50 + str * 0.25 + gauss(roll) * 14)));
    mates.push({ name: MATE_NAMES[k % MATE_NAMES.length], str, cons, year: (k % 4) + 1 });
  }
  return mates;
}

// A plausible tournament field: golfers from other programs, strength
// centered on the committed team's own tier so results feel earned rather
// than arbitrary.
export function generateEventField(college, seedKey, fieldSize = FIELD_SIZE) {
  const roll = rng(hash(seedKey));
  const field = [];
  for (let k = 0; k < fieldSize; k += 1) {
    const str = Math.max(25, Math.min(99, Math.round(college.strength + gauss(roll) * 14)));
    const cons = Math.max(35, Math.min(95, Math.round(50 + str * 0.25 + gauss(roll) * 14)));
    field.push({ name: OPP_NAMES[k % OPP_NAMES.length], str, cons });
  }
  return field;
}

// --- Offseason: graduation, recruiting, and the fight for your spot -------
// Seniors (year 4, about to become year 5) graduate every offseason and are
// replaced one-for-one by incoming freshmen. How good those freshmen are is
// driven by how well the team scored that season — better finishes make the
// program more attractive to recruits — which means a strong season can
// bring in a freshman good enough to push the player down the roster.

export const PLAYER_DEVELOPMENT_SWING = 5; // max strength gained/lost per season from your own play
export const RECRUIT_BONUS_SWING = 10; // max strength bonus/penalty for incoming freshmen from team performance

// 0 (finished last in everything) .. 1 (won everything) .. 0.5 is dead
// mid-pack. Neutral (0.5) if nothing was actually played.
export function computeSeasonPerformance(events) {
  const finished = (events || []).filter((event) => event.done && event.result);
  if (!finished.length) return 0.5;
  const percentiles = finished.map((event) => {
    const { rank, fieldSize } = event.result;
    if (fieldSize <= 1) return 0.5;
    return (fieldSize - rank) / (fieldSize - 1);
  });
  return percentiles.reduce((sum, value) => sum + value, 0) / percentiles.length;
}

// Ages every teammate a year; anyone past year 4 has graduated.
export function ageAndGraduate(teammates) {
  const aged = teammates.map((mate) => ({ ...mate, year: mate.year + 1 }));
  return {
    staying: aged.filter((mate) => mate.year <= 4),
    graduated: aged.filter((mate) => mate.year > 4),
  };
}

// Replaces graduated seniors one-for-one with freshmen (year 1). Strength is
// centered on the team's own level, shifted by season performance — this is
// the "better scores bring better freshmen" rule.
export function recruitFreshmen(count, existingTeammates, college, performanceScore, seedKey) {
  if (count <= 0) return [];
  const roll = rng(hash(seedKey));
  const usedNames = new Set(existingTeammates.map((mate) => mate.name));
  const pool = MATE_NAMES.filter((name) => !usedNames.has(name));
  const names = pool.length >= count ? pool : MATE_NAMES;
  const bonus = Math.round((performanceScore - 0.5) * 2 * RECRUIT_BONUS_SWING);
  const freshmen = [];
  for (let i = 0; i < count; i += 1) {
    const str = Math.max(25, Math.min(99, Math.round(college.strength + bonus + gauss(roll) * 8)));
    const cons = Math.max(35, Math.min(95, Math.round(50 + str * 0.25 + gauss(roll) * 14)));
    freshmen.push({ name: names[i % names.length], str, cons, year: 1 });
  }
  return freshmen;
}

// Every incoming freshman stronger than you takes a spot ahead of you —
// spot number goes up (worse) by one per freshman who beat you out.
export function resolveOffseasonSpotChange(freshmen, playerStrength, currentSpot, rosterSize) {
  const overtakers = freshmen.filter((freshman) => freshman.str > playerStrength).length;
  const newSpot = Math.max(1, Math.min(rosterSize, currentSpot + overtakers));
  return { newSpot, overtakers };
}

// Your own strength moves with your own season, not the team's recruiting —
// play well and you hold your ground against the newcomers; play poorly and
// you fall further behind them too.
export function developPlayerStrength(currentStrength, performanceScore) {
  const delta = Math.round((performanceScore - 0.5) * 2 * PLAYER_DEVELOPMENT_SWING);
  return Math.max(20, Math.min(99, currentStrength + delta));
}
