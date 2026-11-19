function createUsersData(db) {
  const byEmail = db.prepare('SELECT id, email, name, role, password_hash FROM users WHERE email = ?');
  const insert = db.prepare('INSERT INTO users (email, name, password_hash, role) VALUES (?, ?, ?, ?)');
  const count = db.prepare('SELECT COUNT(*) AS n FROM users');

  return {
    findByEmail: (email) => byEmail.get(email),
    create: ({ email, name, passwordHash, role }) => Number(insert.run(email, name, passwordHash, role).lastInsertRowid),
    count: () => count.get().n,
  };
}

module.exports = { createUsersData };
