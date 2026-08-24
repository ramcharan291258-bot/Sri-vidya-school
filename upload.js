import { put, del } from '@vercel/blob';
import { requireAuth } from '../_auth.js';

export const config = { api: { bodyParser: false } };

export default async function handler(req, res) {
  try {
    if (!requireAuth(req)) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    if (!process.env.BLOB_READ_WRITE_TOKEN) {
      return res.status(500).json({
        error: 'BLOB_READ_WRITE_TOKEN is not configured'
      });
    }

    if (req.method === 'DELETE') {
      const url = req.headers['x-blob-url'];

      if (url) await del(url);

      return res.status(200).json({ ok: true });
    }

    if (req.method !== 'POST') {
      return res.status(405).json({ error: 'Method not allowed' });
    }

    const chunks = [];

    for await (const chunk of req) {
      chunks.push(chunk);
    }

    const body = Buffer.concat(chunks);

    const contentType =
      req.headers['content-type'] || 'application/octet-stream';

    const originalName = decodeURIComponent(
      (req.headers['x-file-name'] || 'school-image')
        .replace(/[^a-zA-Z0-9._-]/g, '_')
    );

    const blob = await put(
      `uploads/${Date.now()}-${originalName}`,
      body,
      {
        access: 'private',
        contentType,
        addRandomSuffix: true
      }
    );

    return res.status(200).json({
      url: blob.url
    });

  } catch (error) {
    console.error('Upload API error', error);

    return res.status(500).json({
      error: error.message || 'Upload failed'
    });
  }
}
