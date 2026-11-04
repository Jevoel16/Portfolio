import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { posts } from './plugins/posts'

export default defineConfig({
  plugins: [react(), posts()],
  // host: true listens on all interfaces so other devices on the LAN can reach the dev server.
  server: { port: 5173, host: true },
  preview: { host: true },
  build: {
    // three.js (~650 KB) is one lazily loaded vendor chunk on purpose; it never blocks first paint.
    chunkSizeWarningLimit: 700,
    rollupOptions: {
      output: {
        // Separate long-lived vendor chunks, so a content change doesn't bust the three.js cache.
        manualChunks(id) {
          // Vite's preload/commonjs helpers are used by the entry; keep them out of the lazy 3D chunks,
          // or the entry would import (and preload) three.js just to reach a tiny helper.
          if (id.includes('vite/preload-helper') || id.includes('commonjsHelpers')) return 'react'
          if (!id.includes('node_modules')) return undefined
          if (/[\/]node_modules[\/]three[\/]/.test(id)) return 'three'
          if (/[\/]node_modules[\/](@react-three|three-stdlib|troika|maath|zustand|suspend-react|its-fine)/.test(id)) return 'r3f'
          if (/[\/]node_modules[\/](react|react-dom|scheduler|react-router|cookie|set-cookie-parser)[\/]/.test(id)) return 'react'
          return undefined
        },
      },
    },
  },
})
