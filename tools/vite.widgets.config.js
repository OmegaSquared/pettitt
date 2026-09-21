import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// Second bundle: home-page widgets only. `npm run build` runs both configs.
export default defineConfig({
  plugins: [react({ babel: { plugins: ['styled-jsx/babel'] } })],
  base: './',
  publicDir: false,
  build: {
    outDir: '../docs/tools',
    emptyOutDir: false,
    rollupOptions: {
      input: 'src/widgets.jsx',
      output: { format: 'iife', inlineDynamicImports: true, entryFileNames: 'widgets.js', assetFileNames: 'widgets-[name][extname]' },
    },
  },
});
