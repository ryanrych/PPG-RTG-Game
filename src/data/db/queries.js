// Read helpers for the reference-data tables. Shapes rows back into the same
// object shapes gameData.js/recruiting.js already use (home: {name, desc,
// pb9}, tryout: {...}, etc.) so a future switch-over of the live game state
// to these queries is a drop-in swap rather than a rewrite.
import { getDatabaseAsync } from './database';

function courseRowToObject(row) {
  if (!row) return null;
  return { name: row.name, desc: row.description, pb9: row.pb9 };
}

async function loadCoursesById(db) {
  const rows = await db.getAllAsync('SELECT * FROM courses');
  return new Map(rows.map((row) => [row.id, row]));
}

function schoolRowToObject(row, coursesById) {
  const homeCourse = coursesById.get(row.home_course_id);
  return {
    id: row.id,
    name: row.name,
    mascot: row.mascot,
    prestige: row.prestige,
    risk: !!row.risk,
    roster: row.roster,
    hat: row.hat_color,
    shirt: row.shirt_color,
    apparelType: row.apparel_type,
    blurb: row.blurb,
    conf: row.conf_name,
    home: courseRowToObject(homeCourse),
    team: row.team_strength,
    scout: row.scout_baseline,
    champ: { name: row.champ_name, course: courseRowToObject(homeCourse) },
    tryout: {
      bar: row.tryout_bar,
      gir: row.tryout_gir,
      fair: row.tryout_fair,
      putt: row.tryout_putt,
      cutThreshold: row.tryout_cut_threshold ?? undefined,
    },
  };
}

export async function getSchools() {
  const db = await getDatabaseAsync();
  const [schoolRows, coursesById] = await Promise.all([
    db.getAllAsync('SELECT * FROM schools'),
    loadCoursesById(db),
  ]);
  return schoolRows.map((row) => schoolRowToObject(row, coursesById));
}

export async function getSchoolById(id) {
  const db = await getDatabaseAsync();
  const row = await db.getFirstAsync('SELECT * FROM schools WHERE id = ?', [id]);
  if (!row) return null;
  const coursesById = await loadCoursesById(db);
  return schoolRowToObject(row, coursesById);
}

export async function getConferenceRivals(schoolId) {
  const db = await getDatabaseAsync();
  const rows = await db.getAllAsync(
    `SELECT rivals.*, courses.name AS course_name, courses.description AS course_description, courses.pb9 AS course_pb9
     FROM conference_rivals AS rivals
     LEFT JOIN courses ON courses.id = rivals.course_id
     WHERE rivals.school_id = ?
     ORDER BY rivals.sort_order`,
    [schoolId]
  );
  return rows.map((row) => ({
    name: row.name,
    strength: row.strength,
    coachRival: !!row.coach_rival,
    golfer: row.golfer_name,
    course: row.course_name,
    courseDescription: row.course_description,
    coursePb9: row.course_pb9,
  }));
}

// Same shape as gameData.js's CONFERENCES export: { [schoolId]: rival[] }.
export async function getAllConferences() {
  const db = await getDatabaseAsync();
  const schoolRows = await db.getAllAsync('SELECT id FROM schools');
  const entries = await Promise.all(
    schoolRows.map(async (row) => [row.id, await getConferenceRivals(row.id)])
  );
  return Object.fromEntries(entries);
}

export async function getColleges() {
  const db = await getDatabaseAsync();
  const [collegeRows, coursesById] = await Promise.all([
    db.getAllAsync('SELECT * FROM colleges ORDER BY prestige_rank'),
    loadCoursesById(db),
  ]);
  return collegeRows.map((row) => ({
    id: row.id,
    name: row.name,
    mascot: row.mascot,
    conf: row.conf_name,
    strength: row.strength,
    threshold: row.threshold,
    prestigeRank: row.prestige_rank,
    homeCourse: courseRowToObject(coursesById.get(row.home_course_id)),
  }));
}

export async function getCourses() {
  const db = await getDatabaseAsync();
  const rows = await db.getAllAsync('SELECT * FROM courses');
  return rows.map((row) => ({ id: row.id, ...courseRowToObject(row) }));
}
