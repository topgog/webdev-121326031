const { createUsersData } = require('./users');
const { createSessionsData } = require('./sessions');
const { createLabsData } = require('./labs');

// Everything the services may ask the database for, built on one open connection.
function createData(db) {
  return {
    users: createUsersData(db),
    sessions: createSessionsData(db),
    labs: createLabsData(db),
  };
}

module.exports = { createData };
