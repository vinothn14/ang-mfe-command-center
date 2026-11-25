import { defineConfig } from 'vite';
import tsconfigPaths from 'vite-tsconfig-paths';
import { resolve } from 'node:path';

export default defineConfig({
  root: __dirname,
  plugins: [
    tsconfigPaths({ root: '../../' }),
    {
      name: 'dev-widget-entry-rewrite',
      configureServer(server) {
        server.middlewares.use((req, _res, next) => {
          if (req.url === '/widget-entry.js') {
            req.url = '/src/widget-entry.ts';
          }
          next();
        });
      },
    },
  ],
  server: {
    port: 4204,
    strictPort: true,
    cors: true,
  },
  build: {
    outDir: '../../dist/apps/remote-widget/browser',
    emptyOutDir: true,
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'index.html'),
        'widget-entry': resolve(__dirname, 'src/widget-entry.ts'),
      },
      output: {
        entryFileNames: chunkInfo =>
          chunkInfo.name === 'widget-entry' ? 'widget-entry.js' : 'assets/[name]-[hash].js',
      },
    },
  },
  test: {
    globals: true,
    environment: 'jsdom',
    include: ['src/**/*.{test,spec}.{js,mjs,cjs,ts,mts,cts}'],
    reporters: ['default'],
    coverage: {
      reportsDirectory: '../../coverage/apps/remote-widget',
      provider: 'v8',
    },
  },
});
