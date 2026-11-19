const { Router } = require('express');
const { COOKIE, cookieOptions } = require('./session');

function authRoutes({ auth, secure }) {
  const router = Router();

  router.post('/login', async (req, res) => {
    const { email, password } = req.body ?? {};
    const session = await auth.login(email, password);
    res.cookie(COOKIE, session.token, cookieOptions({ secure, expiresAt: session.expiresAt }));
    res.json({ user: session.user });
  });

  router.post('/logout', (req, res) => {
    auth.logout(req.sessionToken);
    res.clearCookie(COOKIE, cookieOptions({ secure }));
    res.status(204).end();
  });

  router.get('/me', (req, res) => {
    res.json({ user: auth.currentUser(req.user) });
  });

  return router;
}

module.exports = { authRoutes };
