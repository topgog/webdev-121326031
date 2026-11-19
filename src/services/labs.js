const { requireUser } = require('./guard');

function createLabsService({ labs }) {
  // Any signed-in user, student or staff, may see the labs.
  function listLabs(user) {
    requireUser(user);
    return labs.listWithWorkstationCount();
  }

  return { listLabs };
}

module.exports = { createLabsService };
