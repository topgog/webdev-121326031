const COOKIE = 'sid';

function readCookie(header, name) {
  if (!header) return undefined;
  for (const part of header.split(';')) {
    const at = part.indexOf('=');
    if (at > 0 && part.slice(0, at).trim() === name) return part.slice(at + 1).trim();
  }
  return undefined;
}

// Puts the signed-in user (or null) on every request, so a route never reads a cookie itself.
function sessionMiddleware(auth) {
  return (req, res, next) => {
    req.sessionToken = readCookie(req.headers.cookie, COOKIE);
    req.user = auth.authenticate(req.sessionToken);
    next();
  };
}

function cookieOptions({ secure, expiresAt }) {
  return { httpOnly: true, sameSite: 'lax', secure, path: '/', ...(expiresAt ? { expires: new Date(expiresAt) } : {}) };
}

module.exports = { COOKIE, sessionMiddleware, cookieOptions };
