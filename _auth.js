import crypto from 'node:crypto';

const secret = process.env.CMS_SESSION_SECRET || 'change-this-secret-in-vercel';
const FIREBASE_API_KEY = process.env.FIREBASE_API_KEY || 'AIzaSyCogUJgzWXqpvM0B_p5owG9IYw-B7YNIfc';
const FIREBASE_PROJECT_ID = process.env.FIREBASE_PROJECT_ID || 'sri-vidya-e-m-school';
const SUPER_ADMIN_EMAIL = 'ramcharan291258@gmail.com';

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
  if (sig.length !== expected.length || !crypto.timingSafeEqual(Buffer.from(sig), Buffer.from(expected))) return false;
  try {
    const data = JSON.parse(Buffer.from(payload, 'base64url').toString('utf8'));
    return data.exp > Date.now() && data.u === SUPER_ADMIN_EMAIL;
  } catch { return false; }
}

export function requireAuth(req) {
  const token = (req.headers.authorization || '').replace(/^Bearer\s+/i, '');
  return verifyToken(token);
}

async function firebaseSignIn(email, password) {
  const response = await fetch(`https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=${encodeURIComponent(FIREBASE_API_KEY)}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password, returnSecureToken: true })
  });
  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    const code = data?.error?.message || 'INVALID_LOGIN_CREDENTIALS';
    throw new Error(code === 'INVALID_LOGIN_CREDENTIALS' ? 'Invalid email or password' : code);
  }
  return data;
}

async function checkSuperAdminUser(idToken, email) {
  const queryUrl = `https://firestore.googleapis.com/v1/projects/${FIREBASE_PROJECT_ID}/databases/(default)/documents:runQuery`;
  const response = await fetch(queryUrl, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${idToken}`
    },
    body: JSON.stringify({
      structuredQuery: {
        from: [{ collectionId: 'users' }],
        where: {
          fieldFilter: {
            field: { fieldPath: 'email' },
            op: 'EQUAL',
            value: { stringValue: email }
          }
        },
        limit: 1
      }
    })
  });

  const rows = await response.json().catch(() => []);
  if (!response.ok) throw new Error(rows?.error?.message || 'Could not verify Firestore admin user');

  const doc = rows.find(row => row.document)?.document;
  if (!doc) throw new Error('Admin user is not registered in Firestore users collection');

  const fields = doc.fields || {};
  const role = fields.role?.stringValue;
  const isActive = fields.isActive?.booleanValue;
  if (role !== 'SUPER_ADMIN' || isActive !== true) {
    throw new Error('Admin user does not have active SUPER_ADMIN access');
  }
  return true;
}

export async function firebaseAdminLogin(email, password) {
  const normalizedEmail = String(email).trim().toLowerCase();
  if (normalizedEmail !== SUPER_ADMIN_EMAIL) throw new Error('This email is not authorized as the school SUPER_ADMIN');
  const auth = await firebaseSignIn(normalizedEmail, password);
  await checkSuperAdminUser(auth.idToken, normalizedEmail);
  return auth;
}
