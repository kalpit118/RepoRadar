import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  // Set base to the repo name for GitHub Pages.
  // Update this to match your repository name, e.g. '/RepoRadar/'
  base: '/RepoRadar/',
  build: {
    outDir: 'dist',
    sourcemap: false,
  },
});
