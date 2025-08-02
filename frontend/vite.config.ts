import { defineConfig } from 'vite'
import reactPlugin from '@vitejs/plugin-react-swc'
import mkcert from 'vite-plugin-mkcert'
import { tanstackRouter } from '@tanstack/router-plugin/vite'
import path from 'path'
import tailwindcss from '@tailwindcss/vite'
// Removed the import for ignoreTsErrors

import { config } from 'dotenv'
config()

console.log(`Using backend URL: ${process.env.BACKEND_URL}`)

// https://vite.dev/config/
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
    // Temporarily removed the custom plugin
    // ignoreTsErrors(),
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
    },
  },
  // Configuration to ignore TypeScript errors
  esbuild: {
    logOverride: {
      'ts-resolver-finding-file': 'silent',
      'ts-resolver-not-found': 'silent',
      'ts-resolver-type-only-import': 'silent',
    },
  },
  // Add a custom plugin to ignore TypeScript errors during dev and build
  optimizeDeps: {
    esbuildOptions: {
      // Disable type checking in dependencies
      tsconfig: './tsconfig.json',
    },
  },
})
