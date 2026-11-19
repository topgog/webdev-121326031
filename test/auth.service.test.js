// The rules of src/services/auth.js, with the real data layer on an in-memory database and a fake clock.
const { test, beforeEach } = require('node:test');
const assert = require('node:assert/strict');
const { openDatabase } = require('../src/data/db');
const { createData } = require('../src/data');
const { createAuthService, SESSION_MS } = require('../src/services/auth');
const { hashPassword } = require('../src/services/password');

let db;
let data;
let clock;
let auth;

beforeEach(async () => {
  db = openDatabase(':memory:');
  data = createData(db);
  clock = { time: 1_000_000 };
  auth = createAuthService({ users: data.users, sessions: data.sessions, now: () => clock.time });
  data.users.create({ email: 'ana@demo.test', name: 'Ана', passwordHash: await hashPassword('correct horse'), role: 'student' });
});

const rejects = (promise, code) => assert.rejects(promise, (error) => error.code === code);

test('login with the right password returns a token and the user, without the hash', async () => {
  const session = await auth.login('ana@demo.test', 'correct horse');
  assert.equal(session.user.name, 'Ана');
  assert.equal(session.user.role, 'student');
  assert.equal('password_hash' in session.user, false);
  assert.equal(session.expiresAt, clock.time + SESSION_MS);
  assert.ok(session.token.length >= 40);
});

test('login ignores capital letters and spaces around the email', async () => {
  const session = await auth.login('  Ana@Demo.TEST ', 'correct horse');
  assert.equal(session.user.email, 'ana@demo.test');
});

test('login rejects an email that is missing, not text or too long, as invalid input', async () => {
  await rejects(auth.login(undefined, 'correct horse'), 'invalid_input');
  await rejects(auth.login('', 'correct horse'), 'invalid_input');
  await rejects(auth.login('no-at-sign', 'correct horse'), 'invalid_input');
  await rejects(auth.login(`${'a'.repeat(250)}@demo.test`, 'correct horse'), 'invalid_input');
});

test('login rejects a password that is missing, not text or absurdly long, as invalid input', async () => {
  await rejects(auth.login('ana@demo.test', undefined), 'invalid_input');
  await rejects(auth.login('ana@demo.test', ''), 'invalid_input');
  await rejects(auth.login('ana@demo.test', 'x'.repeat(201)), 'invalid_input');
});

test('login rejects a wrong password and an unknown email with the same code', async () => {
  await rejects(auth.login('ana@demo.test', 'wrong'), 'invalid_credentials');
  await rejects(auth.login('nobody@demo.test', 'correct horse'), 'invalid_credentials');
});

test('the token opens a session for its owner, and a made-up token opens nothing', async () => {
  const { token } = await auth.login('ana@demo.test', 'correct horse');
  assert.equal(auth.authenticate(token).email, 'ana@demo.test');
  assert.equal(auth.authenticate('made-up'), null);
  assert.equal(auth.authenticate(undefined), null);
});

test('only the hash of the token is stored, never the token itself', async () => {
  const { token } = await auth.login('ana@demo.test', 'correct horse');
  const rows = db.prepare('SELECT token_hash FROM sessions').all();
  assert.equal(rows.length, 1);
  assert.notEqual(rows[0].token_hash, token);
  assert.match(rows[0].token_hash, /^[0-9a-f]{64}$/);
});

test('a session stops working when it expires', async () => {
  const { token } = await auth.login('ana@demo.test', 'correct horse');
  clock.time += SESSION_MS - 1;
  assert.ok(auth.authenticate(token));
  clock.time += 1;
  assert.equal(auth.authenticate(token), null);
});

test('an expired session is cleaned up on the next sign-in', async () => {
  await auth.login('ana@demo.test', 'correct horse');
  clock.time += SESSION_MS + 1;
  assert.equal(db.prepare('SELECT COUNT(*) AS n FROM sessions').get().n, 1);
  await auth.login('ana@demo.test', 'correct horse');
  assert.equal(db.prepare('SELECT COUNT(*) AS n FROM sessions').get().n, 1, 'the old row is gone, only the new one remains');
});

test('logout ends the session, and logging out with no token is harmless', async () => {
  const { token } = await auth.login('ana@demo.test', 'correct horse');
  auth.logout(token);
  assert.equal(auth.authenticate(token), null);
  auth.logout(undefined);
});

test('currentUser gives the user back, and refuses nobody', async () => {
  const { user } = await auth.login('ana@demo.test', 'correct horse');
  assert.equal(auth.currentUser(user), user);
  assert.throws(() => auth.currentUser(null), (error) => error.code === 'unauthenticated');
});
