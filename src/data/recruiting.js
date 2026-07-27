// College recruiting system. Pure data + pure functions — no React, no
// screen state. Input is a single number: the player's scout exposure
// (0-100). Later this gets fed by the high school season result; for now
// call the functions below directly with any test exposure value, e.g.
//
//   import { resolveOffers, sortOffers } from './recruiting';
//   const offers = resolveOffers({ exposure: 72, pinnedIds: ['auburn-university'] });
//   const board = sortOffers(offers, 'prestige');

import { hash, rng } from './gameData';
import { COLLEGE_ROSTER } from './colleges';

// --- Tunable config -------------------------------------------------------

export const OFFER_WINDOW = 22; // guaranteed if 0 <= margin <= this
export const REACH_WINDOW = 18; // reach (pinnable) if 0 < gap <= this

export const MAX_PINS = 5;

// Higher-strength programs get higher bars. Exponent < 1 bunches the elite
// tier's thresholds near the top of the 0-100 scale while spreading lower
// tiers out more — tune this single number to loosen/tighten that bunching.
export const THRESHOLD_CURVE_EXPONENT = 0.5;

export function thresholdFromStrength(strength) {
  return Math.round(100 * (strength / 100) ** THRESHOLD_CURVE_EXPONENT);
}

// Starting roster spot by margin (how far exposure clears the bar). Checked
// top-down, first match wins — keep sorted by descending minMargin.
export const ROSTER_ROLE_BREAKPOINTS = [
  { minMargin: 25, spot: 1, tag: 'Clear #1 Recruit' },
  { minMargin: 15, spot: 2, tag: 'High Priority' },
  { minMargin: 7, spot: 3, tag: 'Solid Contributor' },
  { minMargin: 2, spot: 4, tag: 'Depth Piece' },
  { minMargin: 0, spot: 5, tag: 'Last-Spot Flyer' },
];

export const LAST_ROSTER_ROLE = ROSTER_ROLE_BREAKPOINTS[ROSTER_ROLE_BREAKPOINTS.length - 1];

export function rosterRoleForMargin(margin) {
  return ROSTER_ROLE_BREAKPOINTS.find((tier) => margin >= tier.minMargin) || LAST_ROSTER_ROLE;
}

// Chance a pinned reach converts into a real offer, by gap (threshold -
// exposure). Piecewise-linear between control points — add more points to
// reshape the curve. Calibrated so a ~2-stroke gap converts ~80% of the
// time and the full 18-stroke reach window converts ~15% of the time.
export const REACH_CONVERSION_CURVE = [
  { gap: 0, chance: 0.9 },
  { gap: 2, chance: 0.8 },
  { gap: REACH_WINDOW, chance: 0.15 },
];

export function reachConversionChance(gap) {
  const clamped = Math.max(0, Math.min(REACH_WINDOW, gap));
  const points = REACH_CONVERSION_CURVE;
  for (let i = 0; i < points.length - 1; i += 1) {
    const a = points[i];
    const b = points[i + 1];
    if (clamped >= a.gap && clamped <= b.gap) {
      const t = (clamped - a.gap) / (b.gap - a.gap);
      return a.chance + t * (b.chance - a.chance);
    }
  }
  return points[points.length - 1].chance;
}

// --- College data -----------------------------------------------------
// Real roster (311 programs) from rankings.csv, via ./colleges.js. strength
// (0-100) is the single source of truth there; threshold and prestigeRank
// are derived from it below and stored on each school object.

export const COLLEGES = COLLEGE_ROSTER
  .map((college) => ({ ...college, threshold: thresholdFromStrength(college.strength) }))
  .sort((a, b) => b.strength - a.strength)
  .map((college, index) => ({ ...college, prestigeRank: index + 1 }));

// --- Banding ---------------------------------------------------------------

// margin = exposure - threshold (positive = cleared the bar).
// gap = how far below the bar (only meaningful when margin < 0).
export function bandForSchool(exposure, school) {
  const margin = exposure - school.threshold;
  if (margin >= 0 && margin <= OFFER_WINDOW) {
    return { band: 'guaranteed', margin, gap: 0 };
  }
  if (margin < 0 && -margin <= REACH_WINDOW) {
    return { band: 'reach', margin, gap: -margin };
  }
  return {
    band: 'out-of-range',
    margin,
    gap: margin < 0 ? -margin : 0,
    reason: margin > OFFER_WINDOW ? 'above-window' : 'below-reach',
  };
}

export function evaluateSchool(exposure, school) {
  const { band, margin, gap, reason } = bandForSchool(exposure, school);
  const evaluation = { school, band, margin, gap };
  if (band === 'guaranteed') {
    evaluation.rosterRole = rosterRoleForMargin(margin);
  } else if (band === 'reach') {
    evaluation.conversionChance = reachConversionChance(gap);
  } else {
    evaluation.reason = reason;
  }
  return evaluation;
}

export function evaluateAllSchools(exposure, colleges = COLLEGES) {
  return colleges.map((school) => evaluateSchool(exposure, school));
}

// --- Recruiting board (pinning) --------------------------------------------

export function canPinSchool(schoolId, { exposure, colleges = COLLEGES, pinnedIds = [] }) {
  if (pinnedIds.includes(schoolId)) return { ok: true };
  if (pinnedIds.length >= MAX_PINS) return { ok: false, reason: 'pin-cap' };
  const school = colleges.find((item) => item.id === schoolId);
  if (!school) return { ok: false, reason: 'unknown-school' };
  if (bandForSchool(exposure, school).band === 'out-of-range') return { ok: false, reason: 'out-of-range' };
  return { ok: true };
}

export function pinSchool(pinnedIds, schoolId, opts) {
  if (pinnedIds.includes(schoolId)) return pinnedIds;
  const check = canPinSchool(schoolId, { ...opts, pinnedIds });
  if (!check.ok) return pinnedIds;
  return [...pinnedIds, schoolId];
}

export function unpinSchool(pinnedIds, schoolId) {
  return pinnedIds.filter((id) => id !== schoolId);
}

// --- Resolving the offer sheet ----------------------------------------------

// rng: () => number in [0, 1). Pass `seed` for a reproducible roll (uses the
// same deterministic RNG as the rest of the sim); omit both for Math.random.
export function resolveOffers({ exposure, pinnedIds = [], colleges = COLLEGES, seed, randomFn }) {
  const roll = randomFn || (seed != null ? rng(hash(String(seed))) : Math.random);
  const evaluations = evaluateAllSchools(exposure, colleges);

  const offers = evaluations
    .filter((evaluation) => evaluation.band === 'guaranteed')
    .map((evaluation) => ({
      school: evaluation.school,
      band: 'guaranteed',
      margin: evaluation.margin,
      rosterRole: evaluation.rosterRole,
    }));

  pinnedIds.forEach((id) => {
    const evaluation = evaluations.find((item) => item.school.id === id);
    if (!evaluation || evaluation.band !== 'reach') return; // pinned guaranteed = no-op, out-of-range can't be pinned
    if (roll() < evaluation.conversionChance) {
      offers.push({
        school: evaluation.school,
        band: 'reach-converted',
        margin: evaluation.margin,
        rosterRole: LAST_ROSTER_ROLE,
      });
    }
  });

  return offers;
}

// Always-available fallback: any school can be walked onto regardless of
// offers, entering at the bottom of the roster. Guarantees no dead end.
export function walkOnOffer(school) {
  return { school, band: 'walk-on', margin: null, rosterRole: LAST_ROSTER_ROLE };
}

// --- Offer sheet sorting -----------------------------------------------------

// by: 'prestige' (default) — best program first, ties broken by better slot.
//     'slot' — best starting slot first, ties broken by better program rank.
export function sortOffers(offers, by = 'prestige') {
  const sorted = [...offers];
  sorted.sort((a, b) => {
    if (by === 'slot') {
      const slotDiff = a.rosterRole.spot - b.rosterRole.spot;
      return slotDiff !== 0 ? slotDiff : a.school.prestigeRank - b.school.prestigeRank;
    }
    const prestigeDiff = a.school.prestigeRank - b.school.prestigeRank;
    return prestigeDiff !== 0 ? prestigeDiff : a.rosterRole.spot - b.rosterRole.spot;
  });
  return sorted;
}
