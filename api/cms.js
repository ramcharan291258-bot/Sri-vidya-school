import { readData, writeData } from './_data.js';
import { signToken, requireAuth, firebaseAdminLogin } from './_auth.js';

export default async function handler(req, res) {
  try {
    if (req.method === 'GET') {
      return res.status(200).json(await readData());
    }
    if (req.method === 'POST') {
      const { username, password } = req.body || {};
      if (!username || !password) return res.status(400).json({ error: 'Email and password are required' });
      await firebaseAdminLogin(String(username).trim().toLowerCase(), String(password));
      return res.status(200).json({ token: signToken('admin') });
    }
    if (!requireAuth(req)) return res.status(401).json({ error: 'Unauthorized' });
    if (req.method === 'PUT') return res.status(200).json(await writeData(req.body));
    return res.status(405).json({ error: 'Method not allowed' });
  } catch (error) {
    console.error('CMS API error', error);
    return res.status(401).json({ error: error.message || 'Firebase admin login failed' });
  }
}
