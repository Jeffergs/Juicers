import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import { clearSession, readSessionCookie } from '../utils/session.js';

export const authMiddleware = async (req, res, next) => {
  let decoded;
  try {
    const cookie = readSessionCookie(req);
    const bearer = req.headers.authorization?.match(/^Bearer (\S+)$/)?.[1];
    decoded = jwt.verify(cookie || bearer || '', process.env.JWT_SECRET, { algorithms: ['HS256'] });
  } catch {
    clearSession(res);
    return res.status(401).json({ message: 'Sua sessão expirou. Entre novamente.', code: 'SESSION_EXPIRED' });
  }
  try {
    const user = await User.findById(decoded.id).select('role sessionVersion');
    if (!user || user.role !== decoded.role || (user.sessionVersion || 0) !== (decoded.version || 0)) {
      clearSession(res);
      return res.status(401).json({ message: 'Sua sessão expirou. Entre novamente.', code: 'SESSION_EXPIRED' });
    }
    req.user = { ...decoded, role: user.role };
    return next();
  } catch (error) { return next(error); }
};
