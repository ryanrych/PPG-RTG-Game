// SQLite schema for reference data (schools, conference rivals, colleges,
// courses). This is read-mostly, design-time data — NOT player save/career
// state, which still lives in ../repository.js untouched.
//
// Bump SEED_VERSION whenever the seed data in seed.js changes shape or
// content; database.js re-seeds automatically when the stored version
// doesn't match.
export const SEED_VERSION = 3;

export const SCHEMA_SQL = `
CREATE TABLE IF NOT EXISTS meta (
  key TEXT PRIMARY KEY,
  value TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS courses (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  pb9 INTEGER NOT NULL
);

CREATE TABLE IF NOT EXISTS schools (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  mascot TEXT NOT NULL,
  prestige INTEGER NOT NULL,
  risk INTEGER NOT NULL DEFAULT 0,
  roster INTEGER NOT NULL,
  hat_color TEXT,
  shirt_color TEXT,
  apparel_type TEXT,
  blurb TEXT,
  conf_name TEXT,
  home_course_id TEXT NOT NULL REFERENCES courses(id),
  team_strength INTEGER NOT NULL,
  scout_baseline INTEGER NOT NULL,
  champ_name TEXT,
  tryout_bar INTEGER NOT NULL,
  tryout_gir INTEGER NOT NULL,
  tryout_fair INTEGER NOT NULL,
  tryout_putt INTEGER NOT NULL,
  tryout_cut_threshold INTEGER
);

CREATE TABLE IF NOT EXISTS conference_rivals (
  id TEXT PRIMARY KEY,
  school_id TEXT NOT NULL REFERENCES schools(id),
  name TEXT NOT NULL,
  strength INTEGER NOT NULL,
  coach_rival INTEGER NOT NULL DEFAULT 0,
  golfer_name TEXT,
  course_id TEXT REFERENCES courses(id),
  sort_order INTEGER NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_conference_rivals_school ON conference_rivals(school_id);

CREATE TABLE IF NOT EXISTS colleges (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  mascot TEXT,
  conf_name TEXT,
  strength INTEGER NOT NULL,
  threshold INTEGER NOT NULL,
  prestige_rank INTEGER NOT NULL,
  home_course_id TEXT REFERENCES courses(id)
);
`;
