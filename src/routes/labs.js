const { Router } = require('express');

function labsRoutes({ labs }) {
  const router = Router();

  router.get('/', (req, res) => {
    res.json({ labs: labs.listLabs(req.user) });
  });

  return router;
}

module.exports = { labsRoutes };
