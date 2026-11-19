const { ServiceError } = require('../services/errors');

// The status for each rule a service can report.
const STATUS = {
  invalid_input: 422,
  invalid_credentials: 401,
  unauthenticated: 401,
};

const body = (code, message) => ({ error: { code, message } });

// Express calls this last. A person sees a sentence, never a stack trace.
// eslint-disable-next-line no-unused-vars
function errorHandler(err, req, res, next) {
  if (err instanceof ServiceError) {
    return res.status(STATUS[err.code] ?? 400).json(body(err.code, err.message));
  }
  // A body that is not valid JSON. Not logged: the error carries the raw body, which may hold a password.
  if (err.status >= 400 && err.status < 500) {
    return res.status(err.status).json(body('bad_request', 'Заявката не може да бъде прочетена.'));
  }
  console.error(err.stack ?? err);
  return res.status(500).json(body('internal', 'Нещо се обърка. Опитайте отново.'));
}

module.exports = { errorHandler };
