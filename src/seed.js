// Demo data for the first start on a developer machine. It never runs in production:
// the passwords are random, printed once by src/index.js and stored nowhere but as a hash.
const crypto = require('node:crypto');
const { hashPassword } = require('./services/password');

const ACCOUNTS = [
  { email: 'ana@demo.test', name: 'Ана Демо', role: 'student' },
  { email: 'boris@demo.test', name: 'Борис Демо', role: 'student' },
  { email: 'staff@demo.test', name: 'Служител Демо', role: 'staff' },
];

const LABS = [
  { name: 'Компютърна лаборатория А', workstations: 12 },
  { name: 'Мрежова лаборатория Б', workstations: 8 },
];

// Does nothing when there are already users. Returns the accounts it made, with their passwords.
async function seedDemo(data) {
  if (data.users.count() > 0) return [];

  const created = [];
  for (const account of ACCOUNTS) {
    const password = crypto.randomBytes(9).toString('base64url');
    data.users.create({ ...account, passwordHash: await hashPassword(password) });
    created.push({ email: account.email, role: account.role, password });
  }

  for (const lab of LABS) {
    const labId = data.labs.create(lab.name);
    for (let n = 1; n <= lab.workstations; n += 1) {
      data.labs.addWorkstation(labId, `PC-${String(n).padStart(2, '0')}`);
    }
  }
  return created;
}

module.exports = { seedDemo };
