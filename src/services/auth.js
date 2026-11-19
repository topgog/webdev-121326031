const crypto = require('node:crypto');
const { ServiceError } = require('./errors');
const { requireUser } = require('./guard');
const { hashPassword, verifyPassword } = require('./password');

const SESSION_MS = 7 * 24 * 60 * 60 * 1000;
const MAX_EMAIL = 254;
const MAX_PASSWORD = 200; // scrypt is slow on purpose: do not let anyone feed it a megabyte

const hashToken = (token) => crypto.createHash('sha256').update(token).digest('hex');
const publicUser = (row) => ({ id: row.id, email: row.email, name: row.name, role: row.role });

function createAuthService({ users, sessions, now }) {
  // Hashed once, so that an unknown email costs the same time as a wrong password.
  const dummyHash = hashPassword('not-a-real-password');

  async function login(email, password) {
    const normalized = typeof email === 'string' ? email.trim().toLowerCase() : '';
    if (
      !normalized.includes('@') ||
      normalized.length > MAX_EMAIL ||
      typeof password !== 'string' ||
      password.length === 0 ||
      password.length > MAX_PASSWORD
    ) {
      throw new ServiceError('invalid_input', 'Въведете имейл и парола.');
    }

    const user = users.findByEmail(normalized);
    const passwordOk = await verifyPassword(password, user ? user.password_hash : await dummyHash);
    if (!user || !passwordOk) {
      // the same sentence for both, so the form does not reveal which emails exist
      throw new ServiceError('invalid_credentials', 'Грешен имейл или парола.');
    }

    const token = crypto.randomBytes(32).toString('base64url');
    const expiresAt = now() + SESSION_MS;
    sessions.removeExpired(now());
    sessions.create({ tokenHash: hashToken(token), userId: user.id, expiresAt });
    return { token, expiresAt, user: publicUser(user) };
  }

  // The user behind a session token, or null. Never throws: "nobody" is a normal answer.
  function authenticate(token) {
    if (typeof token !== 'string') return null;
    const row = sessions.findActive(hashToken(token), now());
    return row ? publicUser(row) : null;
  }

  function logout(token) {
    if (typeof token === 'string') sessions.remove(hashToken(token));
  }

  function currentUser(user) {
    return requireUser(user);
  }

  return { login, authenticate, logout, currentUser };
}

module.exports = { createAuthService, SESSION_MS };
