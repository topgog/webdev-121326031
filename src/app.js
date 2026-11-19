const express = require('express');
const { join } = require('node:path');
const { createData } = require('./data');
const { createAuthService } = require('./services/auth');
const { createLabsService } = require('./services/labs');
const { sessionMiddleware } = require('./routes/session');
const { authRoutes } = require('./routes/auth');
const { labsRoutes } = require('./routes/labs');
const { pageRoutes } = require('./routes/pages');
const { errorHandler } = require('./routes/errors');

// Wires the layers together: database connection -> data -> services -> routes.
// db is an open connection; now is the clock (a test passes a fake one).
function createApp({ db, now = Date.now, production = false }) {
  const data = createData(db);
  const auth = createAuthService({ users: data.users, sessions: data.sessions, now });
  const labs = createLabsService({ labs: data.labs });

  const app = express();
  app.disable('x-powered-by');

  app.use((req, res, next) => {
    res.set({
      'Content-Security-Policy': "default-src 'self'; frame-ancestors 'none'",
      'X-Content-Type-Options': 'nosniff',
      'Referrer-Policy': 'same-origin',
      'Cache-Control': 'no-store',
    });
    next();
  });

  app.use('/assets', express.static(join(__dirname, 'web', 'assets'), { index: false, setHeaders: (res) => res.set('Cache-Control', 'no-cache') }));
  app.use(express.json({ limit: '10kb' }));
  app.use(sessionMiddleware(auth));

  app.use('/api/auth', authRoutes({ auth, secure: production }));
  app.use('/api/labs', labsRoutes({ labs }));
  app.use(pageRoutes());

  app.use((req, res) => res.status(404).json({ error: { code: 'not_found', message: 'Няма такава страница.' } }));
  app.use(errorHandler);

  return { app, data, services: { auth, labs } };
}

module.exports = { createApp };
