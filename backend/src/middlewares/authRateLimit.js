import { createHash } from 'node:crypto';
import AuthAttempt from '../models/AuthAttempt.js';
import { normalizeEmail } from '../utils/session.js';

export function authRateLimit({ limit = 15, windowMs = 15 * 60 * 1000 } = {}) {
  return async (req, res, next) => {
    try {
      const now = Date.now();
      // Shared database counters work across serverless instances. TTL cleans old windows.
      const window = Math.floor(now / windowMs);
      const ip = process.env.VERCEL ? req.headers['x-vercel-forwarded-for'] || req.ip : req.ip;
      for (const [scope, max] of [[`${ip}:${normalizeEmail(req.body?.email)}`, limit], [`ip:${ip}`, 100]]) {
        const key = createHash('sha256').update(`${scope}:${window}`).digest('hex');
        const record = await AuthAttempt.findOneAndUpdate({ key }, { $inc: { count: 1 }, $setOnInsert: { expiresAt: new Date((window + 1) * windowMs) } }, { upsert: true, returnDocument: 'after' });
        if (record.count > max) {
          res.setHeader('Retry-After', String(Math.ceil(((window + 1) * windowMs - now) / 1000)));
          return res.status(429).json({ message: 'Muitas tentativas. Aguarde alguns minutos antes de tentar novamente.' });
        }
      }
      return next();
    } catch (error) { return next(error); }
  };
}
