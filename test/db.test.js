const { test } = require('node:test');
const assert = require('node:assert/strict');
const { mkdtempSync, writeFileSync, rmSync } = require('node:fs');
const { tmpdir } = require('node:os');
const { join } = require('node:path');
const { DatabaseSync } = require('node:sqlite');
const { openDatabase, migrate } = require('../src/data/db');
const { createData } = require('../src/data');

test('opening a database applies the numbered migrations, once', () => {
  const db = openDatabase(':memory:');
  const names = db.prepare('SELECT name FROM schema_migrations ORDER BY name').all().map((r) => r.name);
  assert.deepEqual(names, ['001_init.sql']);
  assert.deepEqual(migrate(db), [], 'a second run applies nothing');
});

test('a database file is created, with its folder, on the first start', () => {
  const dir = mkdtempSync(join(tmpdir(), 'labs-'));
  try {
    const file = join(dir, 'nested', 'test.db');
    openDatabase(file).close();
    const again = openDatabase(file);
    assert.equal(again.prepare('SELECT COUNT(*) AS n FROM schema_migrations').get().n, 1);
    again.close();
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
});

test('a migration that fails is rolled back completely and reported by name', () => {
  const dir = mkdtempSync(join(tmpdir(), 'migrations-'));
  try {
    writeFileSync(join(dir, '001_ok.sql'), 'CREATE TABLE a (id INTEGER);');
    writeFileSync(join(dir, '002_bad.sql'), 'CREATE TABLE b (id INTEGER); THIS IS NOT SQL;');
    writeFileSync(join(dir, 'notes.txt'), 'not a migration');
    const db = new DatabaseSync(':memory:');
    assert.throws(() => migrate(db, dir), /migration 002_bad\.sql failed/);
    const tables = db.prepare("SELECT name FROM sqlite_master WHERE type = 'table'").all().map((r) => r.name);
    assert.ok(tables.includes('a'), '001 stays applied');
    assert.ok(!tables.includes('b'), '002 left nothing behind');
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
});

test('deleting a lab deletes its workstations; deleting a user ends their sessions', () => {
  const db = openDatabase(':memory:');
  const data = createData(db);
  const lab = data.labs.create('А');
  data.labs.addWorkstation(lab, 'PC-01');
  const user = data.users.create({ email: 'a@demo.test', name: 'А', passwordHash: 'x', role: 'student' });
  data.sessions.create({ tokenHash: 'h', userId: user, expiresAt: 10 });

  db.prepare('DELETE FROM labs WHERE id = ?').run(lab);
  db.prepare('DELETE FROM users WHERE id = ?').run(user);
  assert.equal(db.prepare('SELECT COUNT(*) AS n FROM workstations').get().n, 0);
  assert.equal(db.prepare('SELECT COUNT(*) AS n FROM sessions').get().n, 0);
});

test('an email can be used once, and a role must be student or staff', () => {
  const data = createData(openDatabase(':memory:'));
  data.users.create({ email: 'a@demo.test', name: 'А', passwordHash: 'x', role: 'student' });
  assert.throws(() => data.users.create({ email: 'a@demo.test', name: 'Б', passwordHash: 'x', role: 'student' }));
  assert.throws(() => data.users.create({ email: 'b@demo.test', name: 'Б', passwordHash: 'x', role: 'admin' }));
});
