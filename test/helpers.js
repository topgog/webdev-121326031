// Shared by the tests: a real app on a random port with a throwaway in-memory database.
const { openDatabase } = require('../src/data/db');
const { createApp } = require('../src/app');
const { hashPassword } = require('../src/services/password');

async function startApp({ production = false } = {}) {
  const db = openDatabase(':memory:');
  const clock = { time: Date.UTC(2026, 10, 19, 12, 0, 0) };
  const built = createApp({ db, now: () => clock.time, production });
  const server = await new Promise((resolve) => {
    const s = built.app.listen(0, '127.0.0.1', () => resolve(s));
  });
  return {
    ...built,
    db,
    clock,
    base: `http://127.0.0.1:${server.address().port}`,
    close: () => {
      server.closeAllConnections();
      return new Promise((resolve) => server.close(resolve));
    },
  };
}

async function addUser(data, { email, password, name = 'Тест Потребител', role = 'student' }) {
  return data.users.create({ email, name, passwordHash: await hashPassword(password), role });
}

// Signs in through the real endpoint and returns the Cookie header for later requests.
async function signIn(base, email, password) {
  const response = await fetch(`${base}/api/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  });
  if (response.status !== 200) throw new Error(`sign-in failed with ${response.status}`);
  return response.headers.get('set-cookie').split(';')[0];
}

module.exports = { startApp, addUser, signIn };
