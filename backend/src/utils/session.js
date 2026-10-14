import jwt from 'jsonwebtoken';

export const SESSION_COOKIE = 'juicers_session';
export function issueSession(res, user) {
  const token = jwt.sign({ id: user._id, role: user.role, version: user.sessionVersion || 0, authTime: Math.floor(Date.now() / 1000) }, process.env.JWT_SECRET, { expiresIn: '7d' });
  res.cookie(SESSION_COOKIE, token, cookieOptions());
}
function cookieOptions() {
  return { httpOnly: true, secure: process.env.NODE_ENV === 'production', sameSite: 'strict', path: '/api', maxAge: 7 * 24 * 60 * 60 * 1000 };
}
export function clearSession(res) {
  const options = cookieOptions();
  delete options.maxAge;
  res.clearCookie(SESSION_COOKIE, options);
}
export function readSessionCookie(req) {
  const entry = (req.headers.cookie || '').split(';').map(value => value.trim()).find(value => value.startsWith(`${SESSION_COOKIE}=`));
  return entry ? decodeURIComponent(entry.slice(SESSION_COOKIE.length + 1)) : null;
}
export function normalizeEmail(value) {
  return typeof value === 'string' ? value.trim().toLowerCase() : '';
}
export function validEmail(value) {
  return value.length <= 254 && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}
export function validPassword(value) {
  // bcrypt uses at most 72 bytes; reject silently truncated passwords.
  return typeof value === 'string' && value.length >= 8 && Buffer.byteLength(value, 'utf8') <= 72;
}
