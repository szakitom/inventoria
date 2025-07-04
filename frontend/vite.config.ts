import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'
import mkcert from 'vite-plugin-mkcert'

import { config } from 'dotenv'
config()

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), mkcert()],
  server: {
    proxy: {
      '/api': {
        target: process.env.BACKEND_URL || 'http://localhost:3000',
        changeOrigin: true,
      },
    },
  },
})
