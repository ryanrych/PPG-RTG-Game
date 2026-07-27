// Populates the SQLite reference tables from the hand-edited JS config
// (gameData.js, recruiting.js). Those files stay the source of truth you
// and I edit for game balance — this is just the load step. Runs inside a
// transaction and is safe to re-run (clears and reinserts).
import { SCHOOLS, CONFERENCES } from '../gameData';
import { COLLEGES } from '../recruiting';

function slugify(value) {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
}

export async function seedDatabase(db) {
  await db.withTransactionAsync(async () => {
    await db.execAsync(`
      DELETE FROM conference_rivals;
      DELETE FROM colleges;
      DELETE FROM schools;
      DELETE FROM courses;
    `);

    for (const school of SCHOOLS) {
      const homeCourseId = `course-${school.id}-home`;
      await db.runAsync(
        'INSERT INTO courses (id, name, description, pb9) VALUES (?, ?, ?, ?)',
        [homeCourseId, school.home.name, school.home.desc, school.home.pb9]
      );

      await db.runAsync(
        `INSERT INTO schools
          (id, name, mascot, prestige, risk, roster, hat_color, shirt_color, apparel_type, blurb,
           conf_name, home_course_id, team_strength, scout_baseline, champ_name,
           tryout_bar, tryout_gir, tryout_fair, tryout_putt, tryout_cut_threshold)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          school.id,
          school.name,
          school.mascot,
          school.prestige,
          school.risk ? 1 : 0,
          school.roster,
          school.hat,
          school.shirt,
          school.apparelType,
          school.blurb,
          school.conf,
          homeCourseId,
          school.team,
          school.scout,
          school.champ.name,
          school.tryout.bar,
          school.tryout.gir,
          school.tryout.fair,
          school.tryout.putt,
          school.tryout.cutThreshold ?? null,
        ]
      );

      const rivals = CONFERENCES[school.id] || [];
      for (let order = 0; order < rivals.length; order += 1) {
        const rival = rivals[order];
        const rivalId = `${school.id}-${slugify(rival.name)}`;
        const rivalCourseId = `course-${rivalId}`;
        // Rival courses default to the parent school's home pb9 (matches
        // current gameplay math) until real course data replaces this row.
        await db.runAsync(
          'INSERT INTO courses (id, name, description, pb9) VALUES (?, ?, ?, ?)',
          [rivalCourseId, rival.course, null, school.home.pb9]
        );
        await db.runAsync(
          `INSERT INTO conference_rivals
            (id, school_id, name, strength, coach_rival, golfer_name, course_id, sort_order)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
          [rivalId, school.id, rival.name, rival.strength, rival.coachRival ? 1 : 0, rival.golfer, rivalCourseId, order]
        );
      }
    }

    for (const college of COLLEGES) {
      await db.runAsync(
        `INSERT INTO colleges (id, name, mascot, conf_name, strength, threshold, prestige_rank, home_course_id)
         VALUES (?, ?, ?, ?, ?, ?, ?, NULL)`,
        [college.id, college.name, college.mascot, college.conf, college.strength, college.threshold, college.prestigeRank]
      );
    }
  });
}
