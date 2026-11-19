const { ServiceError } = require('./errors');

// The one place that says "you must be signed in". Every service that needs a user calls it.
function requireUser(user) {
  if (!user) throw new ServiceError('unauthenticated', 'Влезте в профила си.');
  return user;
}

module.exports = { requireUser };
