import { defineConfig } from 'vite'
import reactPlugin from '@vitejs/plugin-react-swc'
import { VitePWA } from 'vite-plugin-pwa'
import mkcert from 'vite-plugin-mkcert'
import { tanstackRouter } from '@tanstack/router-plugin/vite'
import svgr from 'vite-plugin-svgr'
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
    svgr({
      svgrOptions: {
        plugins: ['@svgr/plugin-svgo', '@svgr/plugin-jsx'],
        svgoConfig: {
          floatPrecision: 2,
        },
      },
    }),
    reactPlugin(),
    tailwindcss(),
    mkcert(),
    VitePWA({
      registerType: 'prompt',
      workbox: {
        navigateFallback: '/index.html',
        navigateFallbackDenylist: [/^\/api\//, /^\/s3\//],
      },
      includeAssets: [
        'favicon.svg',
        'favicon.ico',
        'robots.txt',
        'apple-touch-icon-180x180.png',
      ],
      devOptions: {
        enabled: true,
      },
      // selfDestroying: true,
      manifest: {
        name: 'Inventoria',
        short_name: 'Inventoria',
        description: 'A modern inventory management system',
        theme_color: '#ffffff',
        display: 'standalone',
        icons: [
          {
            src: 'pwa-192x192.png',
            sizes: '192x192',
            type: 'image/png',
          },
          {
            src: 'pwa-512x512.png',
            sizes: '512x512',
            type: 'image/png',
          },
          {
            src: 'pwa-512x512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'any',
          },
          {
            src: 'pwa-512x512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'maskable',
          },
        ],
        screenshots: [
          {
            src: 'screenshot-wide.png',
            sizes: '1599x800',
            type: 'image/png',
            form_factor: 'wide',
          },
          {
            src: 'screenshot-mobile.png',
            sizes: '393x851',
            type: 'image/png',
          },
        ],
      },
    }),
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
    host: true,
  },
  optimizeDeps: {
    esbuildOptions: {
      tsconfig: './tsconfig.json',
    },
  },
})
