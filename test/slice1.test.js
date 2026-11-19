// Slice 1 of SPEC.md: sign-in and the list of labs. Each acceptance criterion has a test with its id in the title.
const { test, before, after } = require('node:test');
const assert = require('node:assert/strict');
const { startApp, signIn } = require('./helpers');
const { seedDemo } = require('../src/seed');

let t;
let accounts;
before(async () => {
  t = await startApp();
  accounts = await seedDemo(t.data);
});
after(() => t.close());

const manual = { redirect: 'manual' };

test('AC-9 a visitor who opens /labs without signing in is redirected to /login', async () => {
  const response = await fetch(`${t.base}/labs`, manual);
  assert.equal(response.status, 302);
  assert.equal(response.headers.get('location'), '/login');
});

test('AC-9 a cookie that is not a real session does not let the visitor in', async () => {
  const response = await fetch(`${t.base}/labs`, { ...manual, headers: { Cookie: 'sid=not-a-real-token' } });
  assert.equal(response.status, 302);
  assert.equal(response.headers.get('location'), '/login');
});

test('AC-9 the labs data is closed too: /api/labs answers 401 without a session', async () => {
  const response = await fetch(`${t.base}/api/labs`);
  assert.equal(response.status, 401);
  assert.equal((await response.json()).error.code, 'unauthenticated');
});

test('AC-10 after signing in with a demo account /labs shows the two demo labs, each with name and number of workstations', async () => {
  const student = accounts.find((a) => a.role === 'student');
  const cookie = await signIn(t.base, student.email, student.password);

  const page = await fetch(`${t.base}/labs`, { ...manual, headers: { Cookie: cookie } });
  assert.equal(page.status, 200);
  assert.match(await page.text(), /<title>Лаборатории/);

  const response = await fetch(`${t.base}/api/labs`, { headers: { Cookie: cookie } });
  assert.equal(response.status, 200);
  const { labs } = await response.json();
  assert.deepEqual(
    labs.map((lab) => [lab.name, lab.workstations]),
    [
      ['Компютърна лаборатория А', 12],
      ['Мрежова лаборатория Б', 8],
    ],
  );
});

test('AC-11 if a row is deleted from the labs table, the lab is gone from /labs after a reload', async () => {
  const staff = accounts.find((a) => a.role === 'staff');
  const cookie = await signIn(t.base, staff.email, staff.password);
  const list = async () => (await (await fetch(`${t.base}/api/labs`, { headers: { Cookie: cookie } })).json()).labs;

  const before = await list();
  assert.equal(before.length, 2);

  t.db.prepare('DELETE FROM labs WHERE id = ?').run(before[0].id);

  const after = await list();
  assert.deepEqual(after.map((lab) => lab.name), [before[1].name]);
  assert.equal(t.db.prepare('SELECT COUNT(*) AS n FROM workstations WHERE lab_id = ?').get(before[0].id).n, 0, 'its workstations went with it');
});

test('a signed-in visitor who opens /login is sent on to /labs, and / goes to /labs', async () => {
  const student = accounts[0];
  const cookie = await signIn(t.base, student.email, student.password);
  const login = await fetch(`${t.base}/login`, { ...manual, headers: { Cookie: cookie } });
  assert.equal(login.headers.get('location'), '/labs');
  const root = await fetch(`${t.base}/`, manual);
  assert.equal(root.headers.get('location'), '/labs');
});

test('the login page is served to a visitor, with its script and styles', async () => {
  const page = await fetch(`${t.base}/login`);
  assert.equal(page.status, 200);
  assert.match(await page.text(), /<form id="login-form"/);
  for (const asset of ['styles.css', 'login.js', 'labs.js']) {
    assert.equal((await fetch(`${t.base}/assets/${asset}`)).status, 200, asset);
  }
});

test('login: the right password answers 200 with a session cookie that JavaScript cannot read', async () => {
  const student = accounts[0];
  const response = await fetch(`${t.base}/api/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: student.email, password: student.password }),
  });
  assert.equal(response.status, 200);
  assert.equal((await response.json()).user.email, student.email);
  const cookie = response.headers.get('set-cookie');
  assert.match(cookie, /^sid=/);
  assert.match(cookie, /HttpOnly/i);
  assert.match(cookie, /SameSite=Lax/i);
  assert.doesNotMatch(cookie, /Secure/i, 'plain http in development');
});

test('login: a wrong password answers 401 with no cookie, and the same sentence as an unknown email', async () => {
  const send = (email, password) =>
    fetch(`${t.base}/api/auth/login`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ email, password }) });
  const wrong = await send(accounts[0].email, 'wrong-password');
  const unknown = await send('nobody@demo.test', 'wrong-password');
  assert.equal(wrong.status, 401);
  assert.equal(unknown.status, 401);
  assert.equal(wrong.headers.get('set-cookie'), null);
  assert.equal((await wrong.json()).error.message, (await unknown.json()).error.message);
});

test('login: missing fields answer 422, and a body that is not JSON answers 400 without echoing it', async () => {
  const empty = await fetch(`${t.base}/api/auth/login`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: '{}' });
  assert.equal(empty.status, 422);

  const broken = await fetch(`${t.base}/api/auth/login`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: '{"password":"secret-value' });
  assert.equal(broken.status, 400);
  assert.doesNotMatch(await broken.text(), /secret-value/);
});

test('logout ends the session: the old cookie no longer opens /api/labs', async () => {
  const cookie = await signIn(t.base, accounts[1].email, accounts[1].password);
  assert.equal((await fetch(`${t.base}/api/labs`, { headers: { Cookie: cookie } })).status, 200);
  const out = await fetch(`${t.base}/api/auth/logout`, { method: 'POST', headers: { Cookie: cookie } });
  assert.equal(out.status, 204);
  assert.equal((await fetch(`${t.base}/api/labs`, { headers: { Cookie: cookie } })).status, 401);
});

test('/api/auth/me answers with the signed-in user, and 401 for nobody', async () => {
  const cookie = await signIn(t.base, accounts[2].email, accounts[2].password);
  const me = await fetch(`${t.base}/api/auth/me`, { headers: { Cookie: cookie } });
  assert.equal((await me.json()).user.role, 'staff');
  assert.equal((await fetch(`${t.base}/api/auth/me`)).status, 401);
});

test('responses carry the security headers, and an unknown path is a 404 in JSON', async () => {
  const response = await fetch(`${t.base}/nothing-here`);
  assert.equal(response.status, 404);
  assert.equal((await response.json()).error.code, 'not_found');
  assert.match(response.headers.get('content-security-policy'), /default-src 'self'/);
  assert.equal(response.headers.get('x-content-type-options'), 'nosniff');
  assert.equal(response.headers.get('x-powered-by'), null);
});

test('an unexpected failure is a 500 with a sentence, not a stack trace', async (context) => {
  context.mock.method(console, 'error', () => {});
  context.mock.method(t.data.labs, 'listWithWorkstationCount', () => {
    throw new Error('database is on fire');
  });
  const cookie = await signIn(t.base, accounts[0].email, accounts[0].password);
  const response = await fetch(`${t.base}/api/labs`, { headers: { Cookie: cookie } });
  assert.equal(response.status, 500);
  assert.doesNotMatch(await response.text(), /on fire/);
});
