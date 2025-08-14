import { defineConfig } from 'vite'
import reactPlugin from '@vitejs/plugin-react-swc'
import mkcert from 'vite-plugin-mkcert'
import { tanstackRouter } from '@tanstack/router-plugin/vite'
import path from 'path'
import tailwindcss from '@tailwindcss/vite'

import { config } from 'dotenv'
config()

console.log(`Using backend URL: ${process.env.BACKEND_URL}`)
console.log(`Using S3 URL: ${process.env.S3_URL}`)

export default defineConfig({
  base: '/',
  plugins: [
    tanstackRouter({
      target: 'react',
      autoCodeSplitting: true,
    }),
    reactPlugin(),
    tailwindcss(),
    mkcert(),
  ],
  resolve: {
    alias: {
      '@components': '/src/components',
      '@routes': '/src/routes',
      '@utils': '/src/utils',
      '@assets': '/src/assets',
      '@': path.resolve(__dirname, './src'),
    },
  },
  server: {
    proxy: {
      '/api': {
        target: process.env.BACKEND_URL,
        changeOrigin: true,
      },
      '/s3': {
        target: process.env.S3_URL,
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/s3/, ''),
      },
    },
  },
  optimizeDeps: {
    esbuildOptions: {
      tsconfig: './tsconfig.json',
    },
  },
})
