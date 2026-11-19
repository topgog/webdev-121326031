const { Router } = require('express');
const { join } = require('node:path');

const PAGES = join(__dirname, '..', 'web', 'pages');

// The HTML pages. A visitor without a session is sent to /login; the data itself
// is protected separately, by the service behind /api/labs.
function pageRoutes() {
  const router = Router();
  const send = (res, file) => res.sendFile(file, { root: PAGES });

  router.get('/', (req, res) => res.redirect('/labs'));
  router.get('/login', (req, res) => (req.user ? res.redirect('/labs') : send(res, 'login.html')));
  router.get('/labs', (req, res) => (req.user ? send(res, 'labs.html') : res.redirect('/login')));

  return router;
}

module.exports = { pageRoutes };
