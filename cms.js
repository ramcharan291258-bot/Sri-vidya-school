import { readData, writeData } from '../_data.js';
import { signToken, requireAuth } from '../_auth.js';

export default async function handler(req, res) {
  try {
    if (req.method === 'GET') return res.status(200).json(await readData());
    if (req.method === 'POST') {
      const { username, password } = req.body || {};
      const ok = username === (process.env.CMS_ADMIN_USER || 'admin') && password === (process.env.CMS_ADMIN_PASSWORD || 'change-me');
      if (!ok) return res.status(401).json({ error: 'Invalid admin credentials' });
      return res.status(200).json({ token: signToken(username) });
    }
    if (!requireAuth(req)) return res.status(401).json({ error: 'Unauthorized' });
    if (req.method === 'PUT') return res.status(200).json(await writeData(req.body));
    return res.status(405).json({ error: 'Method not allowed' });
  } catch (error) {
    console.error('CMS API error', error);
    return res.status(500).json({ error: error.message || 'CMS error' });
  }
}
