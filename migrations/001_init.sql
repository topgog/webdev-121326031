-- Slice 1: accounts, sessions, labs and their workstations.
-- Never edit this file after it has run anywhere: add 002_... instead.

CREATE TABLE users (
  id            INTEGER PRIMARY KEY AUTOINCREMENT,
  email         TEXT NOT NULL UNIQUE,
  name          TEXT NOT NULL,
  password_hash TEXT NOT NULL,
  role          TEXT NOT NULL CHECK (role IN ('student', 'staff')),
  created_at    TEXT NOT NULL DEFAULT (datetime('now'))
);

-- The browser holds a random token; only its SHA-256 is stored, so a leaked
-- database cannot be used to sign in.
CREATE TABLE sessions (
  token_hash TEXT PRIMARY KEY,
  user_id    INTEGER NOT NULL REFERENCES users (id) ON DELETE CASCADE,
  expires_at INTEGER NOT NULL, -- milliseconds since the epoch
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);
CREATE INDEX sessions_user_id ON sessions (user_id);

CREATE TABLE labs (
  id         INTEGER PRIMARY KEY AUTOINCREMENT,
  name       TEXT NOT NULL UNIQUE,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE workstations (
  id     INTEGER PRIMARY KEY AUTOINCREMENT,
  lab_id INTEGER NOT NULL REFERENCES labs (id) ON DELETE CASCADE,
  name   TEXT NOT NULL,
  UNIQUE (lab_id, name)
);
CREATE INDEX workstations_lab_id ON workstations (lab_id);
