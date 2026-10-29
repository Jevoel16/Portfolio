import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  // host: true listens on all interfaces so other devices on the LAN can reach the dev server.
  server: { port: 5173, host: true },
  preview: { host: true },
  // three.js lives in the lazy SpaceScene chunk on purpose; the main bundle stays small.
  build: { chunkSizeWarningLimit: 1000 },
})
