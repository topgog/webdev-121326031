const { test } = require('node:test');
const assert = require('node:assert/strict');
const { hashPassword, verifyPassword } = require('../src/services/password');

test('a password is stored as a salted hash, never as text', async () => {
  const one = await hashPassword('correct horse');
  const two = await hashPassword('correct horse');
  assert.match(one, /^scrypt:[0-9a-f]+:[0-9a-f]+$/);
  assert.doesNotMatch(one, /correct horse/);
  assert.notEqual(one, two, 'a new salt each time');
});

test('the right password verifies and a wrong one does not', async () => {
  const stored = await hashPassword('correct horse');
  assert.equal(await verifyPassword('correct horse', stored), true);
  assert.equal(await verifyPassword('wrong horse', stored), false);
});

test('a damaged or foreign hash is a failed check, not a crash', async () => {
  assert.equal(await verifyPassword('x', 'plain-text-password'), false);
  assert.equal(await verifyPassword('x', 'md5:00:00'), false);
  assert.equal(await verifyPassword('x', 'scrypt'), false);
  assert.equal(await verifyPassword('x', 'scrypt:zz:'), false);
  assert.equal(await verifyPassword('x', 'scrypt:00:00'), false);
});
