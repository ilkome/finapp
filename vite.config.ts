import { defineConfig } from 'vite'

export default defineConfig({
  define: {
    'import.meta.client': true,
  },
  resolve: {
    alias: {
      '~/': '/app/',
      '~~/': '/',
    },
  },
})
