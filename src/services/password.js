const crypto = require('node:crypto');
const { promisify } = require('node:util');

const scrypt = promisify(crypto.scrypt);
const SALT_BYTES = 16;
const KEY_BYTES = 64;

// "scrypt:<salt>:<key>", both in hex. The password itself is never stored.
async function hashPassword(password) {
  const salt = crypto.randomBytes(SALT_BYTES);
  const key = await scrypt(password, salt, KEY_BYTES);
  return `scrypt:${salt.toString('hex')}:${key.toString('hex')}`;
}

async function verifyPassword(password, stored) {
  const [scheme, saltHex, keyHex] = stored.split(':');
  if (scheme !== 'scrypt') return false;
  try {
    const expected = Buffer.from(keyHex, 'hex');
    // an empty or short key would make two empty buffers "equal": refuse it before comparing
    if (expected.length !== KEY_BYTES) return false;
    const actual = await scrypt(password, Buffer.from(saltHex, 'hex'), expected.length);
    return crypto.timingSafeEqual(actual, expected);
  } catch {
    // a damaged hash is a failed sign-in, not a crash
    return false;
  }
}

module.exports = { hashPassword, verifyPassword };
