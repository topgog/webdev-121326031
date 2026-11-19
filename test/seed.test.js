const { test } = require('node:test');
const assert = require('node:assert/strict');
const { openDatabase } = require('../src/data/db');
const { createData } = require('../src/data');
const { seedDemo } = require('../src/seed');
const { verifyPassword } = require('../src/services/password');

test('the demo seed makes 3 accounts and 2 labs on an empty database, with passwords stored only as hashes', async () => {
  const data = createData(openDatabase(':memory:'));
  const accounts = await seedDemo(data);
  assert.equal(accounts.length, 3);
  assert.deepEqual(accounts.map((a) => a.role), ['student', 'student', 'staff']);
  assert.equal(new Set(accounts.map((a) => a.password)).size, 3, 'a different random password each');
  for (const account of accounts) {
    const stored = data.users.findByEmail(account.email).password_hash;
    assert.doesNotMatch(stored, new RegExp(account.password));
    assert.equal(await verifyPassword(account.password, stored), true);
  }
  assert.equal(data.labs.listWithWorkstationCount().length, 2);
});

test('the demo seed does nothing when there are users already, so a deleted lab stays deleted', async () => {
  const data = createData(openDatabase(':memory:'));
  await seedDemo(data);
  const lab = data.labs.listWithWorkstationCount()[0];
  data.labs.create('Моя лаборатория');
  assert.deepEqual(await seedDemo(data), []);
  assert.equal(data.labs.listWithWorkstationCount().length, 3);
  assert.ok(lab);
});
