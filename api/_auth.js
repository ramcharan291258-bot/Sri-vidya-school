import crypto from 'node:crypto';

const secret = process.env.CMS_SESSION_SECRET || 'change-this-secret-in-vercel';

export function signToken(username) {
  const payload = Buffer.from(JSON.stringify({ u: username, exp: Date.now() + 1000 * 60 * 60 * 12 })).toString('base64url');
  const sig = crypto.createHmac('sha256', secret).update(payload).digest('base64url');
  return `${payload}.${sig}`;
}

export function verifyToken(token) {
  if (!token) return false;
  const [payload, sig] = token.split('.');
  if (!payload || !sig) return false;
  const expected = crypto.createHmac('sha256', secret).update(payload).digest('base64url');
  if (!crypto.timingSafeEqual(Buffer.from(sig), Buffer.from(expected))) return false;
  try {
    const data = JSON.parse(Buffer.from(payload, 'base64url').toString('utf8'));
    return data.exp > Date.now() && data.u === (process.env.CMS_ADMIN_USER || 'admin');
  } catch { return false; }
}

export function requireAuth(req) {
  const token = (req.headers.authorization || '').replace(/^Bearer\s+/i, '');
  return verifyToken(token);
}
