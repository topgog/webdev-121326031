// Opens the SQLite database and applies the numbered files in migrations/.
// The only code outside this folder that may know SQL exists is the migration files.
const { DatabaseSync } = require('node:sqlite');
const { mkdirSync, readdirSync, readFileSync } = require('node:fs');
const { dirname, join } = require('node:path');

const MIGRATIONS_DIR = join(__dirname, '..', '..', 'migrations');

// Runs every migration that has not run yet, each in its own transaction.
// Returns the names it applied.
function migrate(db, dir = MIGRATIONS_DIR) {
  db.exec(`CREATE TABLE IF NOT EXISTS schema_migrations (
    name       TEXT PRIMARY KEY,
    applied_at TEXT NOT NULL DEFAULT (datetime('now'))
  )`);
  const done = new Set(db.prepare('SELECT name FROM schema_migrations').all().map((row) => row.name));
  const pending = readdirSync(dir)
    .filter((file) => /^\d+_.+\.sql$/.test(file) && !done.has(file))
    .sort();

  for (const file of pending) {
    db.exec('BEGIN');
    try {
      db.exec(readFileSync(join(dir, file), 'utf8'));
      db.prepare('INSERT INTO schema_migrations (name) VALUES (?)').run(file);
      db.exec('COMMIT');
    } catch (error) {
      db.exec('ROLLBACK');
      throw new Error(`migration ${file} failed: ${error.message}`);
    }
  }
  return pending;
}

// file is a path, or ':memory:' for a throwaway database (tests).
function openDatabase(file) {
  if (file !== ':memory:') mkdirSync(dirname(file), { recursive: true });
  const db = new DatabaseSync(file);
  db.exec('PRAGMA foreign_keys = ON');
  db.exec('PRAGMA busy_timeout = 3000');
  migrate(db);
  return db;
}

module.exports = { openDatabase, migrate };
