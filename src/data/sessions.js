function createSessionsData(db) {
  const insert = db.prepare('INSERT INTO sessions (token_hash, user_id, expires_at) VALUES (?, ?, ?)');
  const active = db.prepare(`
    SELECT u.id, u.email, u.name, u.role
    FROM sessions s JOIN users u ON u.id = s.user_id
    WHERE s.token_hash = ? AND s.expires_at > ?`);
  const remove = db.prepare('DELETE FROM sessions WHERE token_hash = ?');
  const removeExpired = db.prepare('DELETE FROM sessions WHERE expires_at <= ?');

  return {
    create: ({ tokenHash, userId, expiresAt }) => {
      insert.run(tokenHash, userId, expiresAt);
    },
    findActive: (tokenHash, nowMs) => active.get(tokenHash, nowMs),
    remove: (tokenHash) => {
      remove.run(tokenHash);
    },
    removeExpired: (nowMs) => {
      removeExpired.run(nowMs);
    },
  };
}

module.exports = { createSessionsData };
