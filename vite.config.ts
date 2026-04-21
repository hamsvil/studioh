import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import { nodePolyfills } from 'vite-plugin-node-polyfills';
import path from 'path';
import { defineConfig, loadEnv } from 'vite';

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, '.', '');
  return {
    plugins: [
      react(), 
      tailwindcss(),
      nodePolyfills({
        // Whether to polyfill `node:` protocol imports.
        protocolImports: true,
        exclude: ['fs'], // Exclude 'fs' to prevent the empty.js/promises Vite resolver bug
      }),
    ],
    define: {
      'process.env.GEMINI_API_KEY': JSON.stringify(env.GEMINI_API_KEY),
    },
    resolve: {
      alias: [
        { find: '@', replacement: path.resolve(__dirname, './src') },
        // Use an absolute path for fs/promises to ensure esbuild finds the stub file correctly
        { find: /^fs\/promises$/, replacement: path.resolve(__dirname, 'src/empty-promises.ts') },
        { find: /^node:fs\/promises$/, replacement: path.resolve(__dirname, 'src/empty-promises.ts') },
        { find: /^fs$/, replacement: path.resolve(__dirname, 'src/empty-promises.ts') },
        { find: /^node:fs$/, replacement: path.resolve(__dirname, 'src/empty-promises.ts') },
        // Fallback common node internals if they are missed by polyfills plugin
        { find: 'buffer', replacement: 'buffer' },
        { find: 'process', replacement: 'process' },
        { find: 'events', replacement: 'events' },
        { find: 'path', replacement: 'path-browserify' },
        { find: 'crypto', replacement: 'crypto-browserify' },
        { find: 'stream', replacement: 'stream-browserify' },
        { find: 'util', replacement: 'util' },
      ],
      // Memastikan dependensi dnd-kit diselesaikan dari node_modules root
      dedupe: ['@dnd-kit/core', '@dnd-kit/sortable', '@dnd-kit/utilities', 'd3', 'idb-keyval', 'rxdb'],
    },
    server: {
      // HMR is disabled in AI Studio via DISABLE_HMR env var.
      // Do not modify—file watching is disabled to prevent flickering during agent edits.
      hmr: process.env.DISABLE_HMR !== 'true',
      headers: {
        'Cross-Origin-Embedder-Policy': 'require-corp',
        'Cross-Origin-Opener-Policy': 'same-origin',
      },
    },
    worker: {
      format: 'es',
    },
  };
});
