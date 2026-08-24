import crypto from 'node:crypto';

const secret = process.env.CMS_SESSION_SECRET || 'change-this-secret-in-vercel';
const FIREBASE_API_KEY = process.env.FIREBASE_WEB_API_KEY || 'AIzaSyCogUJgzWXqpvM0B_p5owG9IYw-B7YNIfc';
const FIREBASE_PROJECT_ID = 'sri-vidya-e-m-school';
const ADMIN_EMAIL = 'ramcharan291258@gmail.com';

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
    return data.exp > Date.now() && data.u === (process.env.CMS_ADMIN_USER || 'admin');
  } catch { return false; }
}

export function requireAuth(req) {
  const token = (req.headers.authorization || '').replace(/^Bearer\s+/i, '');
  return verifyToken(token);
}

function firestoreValue(value) {
  if (!value) return undefined;
  if ('stringValue' in value) return value.stringValue;
  if ('booleanValue' in value) return value.booleanValue;
  if ('integerValue' in value) return Number(value.integerValue);
  return undefined;
}

export async function firebaseAdminLogin(email, password) {
  const authResponse = await fetch(`https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=${FIREBASE_API_KEY}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password, returnSecureToken: true }),
  });
  const authData = await authResponse.json().catch(() => ({}));
  if (!authResponse.ok) {
    const code = authData?.error?.message || 'INVALID_LOGIN_CREDENTIALS';
    const messages = {
      EMAIL_NOT_FOUND: 'Invalid email or password',
      INVALID_PASSWORD: 'Invalid email or password',
      INVALID_LOGIN_CREDENTIALS: 'Invalid email or password',
      USER_DISABLED: 'This Firebase account is disabled',
      OPERATION_NOT_ALLOWED: 'Email/password sign-in is not enabled in Firebase Authentication',
    };
    throw new Error(messages[code] || 'Firebase login failed');
  }

  if ((authData.email || '').toLowerCase() !== ADMIN_EMAIL) {
    throw new Error('This Firebase account is not authorized for School Admin access');
  }

  const queryResponse = await fetch(`https://firestore.googleapis.com/v1/projects/${FIREBASE_PROJECT_ID}/databases/(default)/documents:runQuery`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${authData.idToken}`,
    },
    body: JSON.stringify({
      structuredQuery: {
        from: [{ collectionId: 'users' }],
        where: { fieldFilter: { field: { fieldPath: 'email' }, op: 'EQUAL', value: { stringValue: ADMIN_EMAIL } } },
        limit: 1,
      },
    }),
  });
  const queryData = await queryResponse.json().catch(() => []);
  if (!queryResponse.ok) {
    throw new Error('Firebase login succeeded, but Firestore users access is not configured for this account');
  }

  const row = Array.isArray(queryData) ? queryData.find(item => item.document) : null;
  const fields = row?.document?.fields || {};
  const role = firestoreValue(fields.role);
  const isActive = firestoreValue(fields.isActive);
  if (role !== 'SUPER_ADMIN' || isActive !== true) {
    throw new Error('Admin access denied: Firestore user must have role SUPER_ADMIN and isActive true');
  }

  return { uid: authData.localId, email: authData.email, idToken: authData.idToken };
}
