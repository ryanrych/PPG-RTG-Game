// Scout exposure formula. Runs once at the end of the high school season and
// produces a single 0-100 number that becomes the `exposure` input to the
// recruiting system (see ./recruiting.js). Pure data + pure functions — no
// React, no screen state — so it's easy to feed a test season directly:
//
//   import { computeExposure } from './exposure';
//   const exposure = computeExposure({
//     scoutBaseline: 12,       // school.scout, e.g. Cordwood = 12
//     spot: 1,                 // final depth-chart spot
//     events: [                // one entry per played event (4 meets + champ)
//       { toPar: -7, pb9: -7, holes: 9 },
//       { toPar: -7, pb9: -7, holes: 9 },
//       { toPar: -7, pb9: -7, holes: 9 },
//       { toPar: -7, pb9: -7, holes: 9 },
//       { toPar: -14, pb9: -7, holes: 18 },
//     ],
//     matchRecord: { wins: 4, losses: 0, halves: 0 },
//     champFinish: { rank: 1, fieldSize: 11 },
//   });

// --- Tunable config ---------------------------------------------------------

// positionFactor discounts platform by final depth-chart spot, but only
// slightly: varsity-1 keeps the full baseline, each spot lower trims a
// little, floored so the bottom of even a big roster still keeps most of
// the platform.
export const POSITION_FACTOR_RATE = 0.05;
export const POSITION_FACTOR_FLOOR = 0.7;

// Normalizes platform to 0..1 — should match the highest school scout_baseline
// (Kingsley = 95).
export const MAX_SCOUT_BASELINE = 95;

// performance = SCORING_PERF_WEIGHT * scoringPerf + RESULTS_BONUS_WEIGHT * resultsBonus
export const SCORING_PERF_WEIGHT = 0.8;
export const RESULTS_BONUS_WEIGHT = 0.2;

// resultsBonus = RESULTS_MATCH_WEIGHT * matchRecordScore + RESULTS_CHAMP_WEIGHT * champFinishScore
export const RESULTS_MATCH_WEIGHT = 0.5;
export const RESULTS_CHAMP_WEIGHT = 0.5;

// exposure = clamp((EXPOSURE_PLATFORM_WEIGHT * platformN + EXPOSURE_PERFORMANCE_WEIGHT * performance
//              + EXPOSURE_COUPLING_WEIGHT * platformN * performance) * 100, 0, 100)
export const EXPOSURE_PLATFORM_WEIGHT = 0.45;
export const EXPOSURE_PERFORMANCE_WEIGHT = 0.55;
export const EXPOSURE_COUPLING_WEIGHT = 0.15;

// --- Platform ----------------------------------------------------------------

export function positionFactor(spot) {
  const factor = 1 - (spot - 1) * POSITION_FACTOR_RATE;
  return Math.max(POSITION_FACTOR_FLOOR, Math.min(1, factor));
}

export function platformScore(scoutBaseline, spot) {
  return scoutBaseline * positionFactor(spot);
}

// --- Performance: scoring (difficulty-adjusted) -----------------------------

// The achievable ceiling for one played round: the course's 9-hole personal
// best, scaled to how many holes were actually played. An 18-hole
// championship round is judged against two 9-hole ceilings stacked, which
// matches how the scoring engine builds an 18-hole round from two
// independent 9-hole pb-anchored draws (see score9/distribute in gameData.js).
export function eventCeiling(pb9, holes) {
  return pb9 * (holes / 9);
}

// How close the player's score came to that ceiling: 0 = shot par, 1 =
// matched the ceiling. Course-relative by construction, so an easy course's
// forgiving ceiling can't inflate this the way raw score-to-par would — two
// players of equal skill on courses of different difficulty land on the
// same scoringPerf.
export function eventScoringPerf(toPar, pb9, holes) {
  const ceiling = eventCeiling(pb9, holes);
  if (ceiling >= 0) return 0;
  return Math.max(0, Math.min(1, toPar / ceiling));
}

export function seasonScoringPerf(events) {
  if (!events || !events.length) return 0;
  const total = events.reduce((sum, event) => sum + eventScoringPerf(event.toPar, event.pb9, event.holes), 0);
  return total / events.length;
}

// --- Performance: results bonus ---------------------------------------------

export function matchRecordScore(matchRecord) {
  const { wins = 0, losses = 0, halves = 0 } = matchRecord || {};
  const total = wins + losses + halves;
  if (total === 0) return 0;
  return (wins + halves * 0.5) / total;
}

export function champFinishScore(champFinish) {
  if (!champFinish || !champFinish.fieldSize || champFinish.fieldSize <= 1) return 0;
  const { rank, fieldSize } = champFinish;
  return Math.max(0, Math.min(1, (fieldSize - rank) / (fieldSize - 1)));
}

export function resultsBonus({ matchRecord, champFinish }) {
  return RESULTS_MATCH_WEIGHT * matchRecordScore(matchRecord) + RESULTS_CHAMP_WEIGHT * champFinishScore(champFinish);
}

export function performanceScore({ events, matchRecord, champFinish }) {
  const scoringPerf = seasonScoringPerf(events);
  const results = resultsBonus({ matchRecord, champFinish });
  return SCORING_PERF_WEIGHT * scoringPerf + RESULTS_BONUS_WEIGHT * results;
}

// --- Combine -----------------------------------------------------------------

// Returns every intermediate number alongside the final exposure — handy for
// testing and for a future breakdown display (mirrors the existing
// "SEASON SCOUT EXPOSURE" hub panel).
export function computeExposureBreakdown({ scoutBaseline, spot, events, matchRecord, champFinish }) {
  const factor = positionFactor(spot);
  const platform = scoutBaseline * factor;
  const platformN = platform / MAX_SCOUT_BASELINE;
  const scoringPerf = seasonScoringPerf(events);
  const results = resultsBonus({ matchRecord, champFinish });
  const performance = SCORING_PERF_WEIGHT * scoringPerf + RESULTS_BONUS_WEIGHT * results;
  const base = EXPOSURE_PLATFORM_WEIGHT * platformN + EXPOSURE_PERFORMANCE_WEIGHT * performance;
  const coupling = EXPOSURE_COUPLING_WEIGHT * platformN * performance;
  const exposure = Math.max(0, Math.min(100, (base + coupling) * 100));
  return { positionFactor: factor, platform, platformN, scoringPerf, resultsBonus: results, performance, base, coupling, exposure };
}

export function computeExposure(input) {
  return computeExposureBreakdown(input).exposure;
}
