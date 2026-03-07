import path from 'path';
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import viteCompression from 'vite-plugin-compression';
import { visualizer } from 'rollup-plugin-visualizer';

export default defineConfig(({ mode }) => {
  const _env = loadEnv(mode, '.', '');
  return {
    base: '/',
    server: {
      port: 3000,
      host: '0.0.0.0',
    },
    plugins: [
      react(),
      // Gzip pre-compression — served by Cloudflare edge
      viteCompression({
        algorithm: 'gzip',
        threshold: 1024,
        ext: '.gz',
      }),
      // Brotli pre-compression — ~15-20% smaller than gzip
      viteCompression({
        algorithm: 'brotliCompress',
        threshold: 1024,
        ext: '.br',
      }),
      // Bundle analyzer — generates dist/stats.html on production builds
      // Open stats.html to inspect bundle composition and catch size regressions
      ...(mode === 'production'
        ? [
            visualizer({
              filename: 'dist/stats.html',
              gzipSize: true,
              brotliSize: true,
              open: false,
            }),
          ]
        : []),
    ],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, './src'),
      },
    },
    esbuild: {
      drop: mode === 'production' ? ['console', 'debugger'] : [],
      pure: mode === 'production' ? ['console.log', 'console.warn'] : [],
    },
    build: {
      // Disable modulepreload entirely — prevents Vite from injecting
      // <link rel="modulepreload"> for ALL chunks in index.html.
      // Without this, vendor-three (727 KB) gets preloaded on every page,
      // even when 3D features aren't used. The browser will still load
      // modules on demand via the import graph. This saves ~244 KB of
      // unnecessary preloading on non-3D pages.
      modulePreload: false,
      // Target modern browsers for smaller bundles
      target: 'es2020',
      // Source maps disabled in production to reduce dist/ size (~7 MB savings).
      // Upload source maps to Sentry separately for production debugging.
      sourcemap: mode === 'production' ? false : true,
      // Chunk size warning threshold (300KB)
      chunkSizeWarningLimit: 300,
      // Enable CSS code splitting for smaller initial load
      cssCodeSplit: true,
      rollupOptions: {
        output: {
          manualChunks(id) {
            // 3D libraries — large, loaded lazily with pages that use model-viewer
            if (id.includes('@google/model-viewer')) {
              return 'vendor-model-viewer';
            }
            if (id.includes('node_modules/three')) {
              return 'vendor-three';
            }
            // Core React
            if (id.includes('node_modules/react-dom')) {
              return 'vendor-react';
            }
            // Router
            if (
              id.includes('node_modules/react-router') ||
              id.includes('node_modules/@remix-run')
            ) {
              return 'vendor-router';
            }
            // Framer Motion — animation library
            if (id.includes('node_modules/framer-motion')) {
              return 'vendor-motion';
            }
            // Icons — tree-shaken but still significant
            if (id.includes('node_modules/lucide-react')) {
              return 'vendor-icons';
            }
            // Supabase SDK
            if (id.includes('node_modules/@supabase')) {
              return 'vendor-supabase';
            }
            // TanStack Query — data fetching & caching layer
            if (id.includes('node_modules/@tanstack')) {
              return 'vendor-query';
            }
            // Remaining third-party
            if (id.includes('node_modules')) {
              return 'vendor';
            }
          },
        },
      },
    },
    test: {
      globals: true,
      environment: 'happy-dom',
      coverage: {
        provider: 'v8',
        reporter: ['text', 'json', 'html'],
        exclude: ['node_modules/'],
        thresholds: {
          lines: 80,
          functions: 80,
          branches: 70,
          statements: 80,
        },
      },
    },
  };
});
