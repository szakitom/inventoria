import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'
import mkcert from 'vite-plugin-mkcert'
import { tanstackRouter } from '@tanstack/router-plugin/vite'
import { ignoreTsErrors } from './src/plugins/ignore-ts-errors'

import { config } from 'dotenv'
config()

console.log(`Using backend URL: ${process.env.BACKEND_URL}`)

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    tanstackRouter({
      target: 'react',
      autoCodeSplitting: true,
    }),
    react(),
    mkcert(),
    ignoreTsErrors(),
  ],
  server: {
    proxy: {
      '/api': {
        target: process.env.BACKEND_URL,
        changeOrigin: true,
      },
    },
  },
  // Additional esbuild configuration to ignore TypeScript errors
  esbuild: {
    logOverride: {
      'ts-resolver-finding-file': 'silent',
      'ts-resolver-not-found': 'silent',
      'ts-resolver-type-only-import': 'silent',
    },
  },
})
