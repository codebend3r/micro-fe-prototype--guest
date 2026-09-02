import { createLogger, defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { federation } from '@module-federation/vite';

// This config runs in Node. The tsconfig loads only the browser lib, so
// declare the one thing read here rather than pull in @types/node.
declare const process: { env: Record<string, string | undefined> };

/**
 * Jerry is one app on one origin. World reaches it by absolute URL, so `base`
 * has to be that origin: every chunk URL jerry emits is resolved from a page
 * world serves, not from jerry's own index.html.
 *
 * Locally that is port 5103, the next one after world's three. Deployed, set
 * `JERRY_ORIGIN` to wherever this repo's build is hosted, trailing slash
 * included, and world points its remote entry at `${JERRY_ORIGIN}remoteEntry.js`.
 */
const PORT = 5103;
const origin = process.env.JERRY_ORIGIN ?? `http://localhost:${PORT}/`;

// World reads real transfer sizes for scripts from other origins only if those
// origins allow it. Same header the in-repo remotes send.
const headers = { 'Timing-Allow-Origin': '*' };

/** @module-federation/vite ships an SSR helper that imports node:vm. Harmless. */
function quietLogger() {
  const logger = createLogger();
  const warn = logger.warn.bind(logger);
  logger.warn = (message, options) => {
    if (message.includes('has been externalized for browser compatibility')) return;
    warn(message, options);
  };
  return logger;
}

export default defineConfig({
  base: origin,
  plugins: [
    react(),
    federation({
      name: 'jerry',
      dts: false,
      filename: 'remoteEntry.js',
      // The whole contract with world: one imperative mount function.
      exposes: {
        './mount': './src/mount.tsx',
      },
      // Nothing shared. Jerry carries its own React 19, wouter and zustand, and
      // world never sees any of them.
      shared: {},
    }),
  ],
  customLogger: quietLogger(),
  build: {
    target: 'chrome89',
    rollupOptions: {
      onwarn(warning, next) {
        if (warning.code === 'EMPTY_BUNDLE') return;
        next(warning);
      },
    },
  },
  server: { port: PORT, strictPort: true, cors: true, headers, origin: origin.replace(/\/$/, '') },
  preview: { port: PORT, strictPort: true, cors: true, headers },
});
