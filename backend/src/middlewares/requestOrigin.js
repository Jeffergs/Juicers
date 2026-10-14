export function requestOrigin(req, res, next) {
  res.setHeader('Cache-Control', 'no-store');
  if (['GET', 'HEAD', 'OPTIONS'].includes(req.method)) return next();
  const origin = req.headers.origin;
  if (!origin) {
    if (req.headers.cookie?.includes('juicers_session=')) return res.status(403).json({ message: 'Origem da requisição ausente.' });
    return next();
  }
  const allowed = [process.env.FRONTEND_URL];
  if (process.env.NODE_ENV !== 'production') allowed.push('http://localhost:5173', 'http://127.0.0.1:5173');
  allowed.push(`${process.env.NODE_ENV === 'production' ? 'https' : req.protocol}://${req.get('host')}`);
  if (!allowed.filter(Boolean).includes(origin)) return res.status(403).json({ message: 'Origem da requisição não autorizada.' });
  return next();
}
