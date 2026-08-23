# Sri Vidya E.M. School — Live CMS + Vercel Backend

This version keeps the existing Sri Vidya E.M. School frontend/design and connects the Admin CMS to a Vercel serverless API and Vercel Blob storage.

## Live architecture

Public website → `GET /api/cms` → Vercel Blob JSON data

Admin login → `POST /api/cms` → signed session token

Admin changes → `PUT /api/cms` → live CMS data

Image upload → `POST /api/upload` → Vercel Blob → saved image URL

Gallery image delete → `DELETE /api/upload` → Vercel Blob delete + CMS update

## Required Vercel environment variables

- `BLOB_READ_WRITE_TOKEN`
- `CMS_ADMIN_USER`
- `CMS_ADMIN_PASSWORD`
- `CMS_SESSION_SECRET`

Create/link a Vercel Blob store to the Vercel project so `BLOB_READ_WRITE_TOKEN` is available. Use a strong production admin password and a long random session secret.

## Local development

The public frontend can still be previewed with Vite:

```powershell
npm install
npm run dev
```

For the actual `/api/*` serverless routes, use Vercel's local development workflow or deploy to Vercel.

## Current official school data

Sri Vidya E.M. School, established 2002, Kesavaram, Ganapavaram Mandal, West Godavari District, Andhra Pradesh - 534186.
Phone: 9491171564
Email: babjivelavalapalli@gmail.com
Principal / Correspondent / Chairman: Velavalapalli Babji
Classes: LKG to 7th Class
Medium: English Medium
6th & 7th: State Syllabus
Transport: School Bus + Van
