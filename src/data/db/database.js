import * as SQLite from 'expo-sqlite';
import { SCHEMA_SQL, SEED_VERSION } from './schema';
import { seedDatabase } from './seed';

const DB_NAME = 'rtg-reference.db';

let dbPromise = null;

// Opens (or creates) the reference-data database, applies the schema, and
// re-seeds from the JS config whenever SEED_VERSION has moved on. Safe to
// call repeatedly — the open/prepare work only happens once per app run.
export function getDatabaseAsync() {
  if (!dbPromise) {
    dbPromise = prepareDatabase().catch((error) => {
      dbPromise = null; // let a later call retry instead of caching a failure
      throw error;
    });
  }
  return dbPromise;
}

async function prepareDatabase() {
  const db = await SQLite.openDatabaseAsync(DB_NAME);
  await db.execAsync(SCHEMA_SQL);

  const row = await db.getFirstAsync('SELECT value FROM meta WHERE key = ?', ['seed_version']);
  const storedVersion = row ? Number(row.value) : 0;
  if (storedVersion !== SEED_VERSION) {
    await seedDatabase(db);
    await db.runAsync(
      `INSERT INTO meta (key, value) VALUES ('seed_version', ?)
       ON CONFLICT(key) DO UPDATE SET value = excluded.value`,
      [String(SEED_VERSION)]
    );
  }

  return db;
}
