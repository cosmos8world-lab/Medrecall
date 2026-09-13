import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// Simple Vite config. No extra plugins so it stays easy to understand.
export default defineConfig({
  plugins: [react()],
  server: {
    host: true, // lets you open it from your iPhone on the same wifi network
    port: 5173
  }
})
