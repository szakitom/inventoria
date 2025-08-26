import { defineConfig } from '@vite-pwa/assets-generator/config'

export default defineConfig({
  headLinkOptions: {
    preset: '2023',
  },
  preset: {
    transparent: {
      favicons: [[48, '../../public/favicon.ico']],
      sizes: [],
    },
    maskable: {
      sizes: [],
    },
    apple: {
      sizes: [],
    },
  },
  images: ['src/assets/logo.svg'],
})
