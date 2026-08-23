import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import fs from 'node:fs';
import path from 'node:path';

function copyRootImages() {
  const imageExt = /\.(png|jpe?g|gif|webp|svg|avif)$/i;
  return {
    name: 'copy-root-images',
    generateBundle() {
      const root = process.cwd();
      const skip = new Set(['node_modules', '.git', 'dist', 'public']);
      const walk = (dir, rel = '') => {
        for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
          if (skip.has(entry.name)) continue;
          const abs = path.join(dir, entry.name);
          const childRel = path.join(rel, entry.name);
          if (entry.isDirectory()) walk(abs, childRel);
          else if (imageExt.test(entry.name)) {
            const normalized = childRel.replaceAll(path.sep, '/');
            this.emitFile({
              type: 'asset',
              fileName: `images/${normalized}`,
              source: fs.readFileSync(abs),
            });
          }
        }
      };
      walk(root);
    },
  };
}

export default defineConfig({
  plugins: [react(), copyRootImages()],
});
