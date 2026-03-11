import process from 'node:process'

import categoryIcons from './app/assets/js/icons.js'

export default defineNuxtConfig({
  colorMode: {
    classSuffix: '',
    fallback: 'dark',
    preference: 'system',
  },

  compatibilityDate: '2024-07-07',
  components: [
    {
      path: '~/components/',
    },
    {
      path: '~/pages',
      pathPrefix: false,
      pattern: '**/_/**',
    },
  ],
  css: ['~/assets/css/main.css'],

  devtools: {
    timeline: {
      enabled: true,
    },
  },

  eslint: {
    config: {
      standalone: false,
    },
  },

  experimental: {
    // viewTransition: true,
  },

  fonts: {
    defaults: {
      subsets: ['cyrillic', 'latin', 'latin-ext'],
    },
    families: [
      { global: true, name: 'Roboto', weights: [400, 500, 600, 700] },
      { global: true, name: 'Roboto Condensed', weights: [400, 500, 600, 700] },
      { global: true, name: 'Nunito', weights: [400, 700, 800] },
      { global: true, name: 'Unica One' },
    ],
  },

  future: {
    compatibilityVersion: 4,
  },

  i18n: {
    defaultLocale: 'en',
    detectBrowserLanguage: {
      cookieKey: 'i18n_redirected',
      useCookie: true,
    },
    locales: [
      {
        code: 'en',
        file: 'en-US.js',
        language: 'en-US',
      },
      {
        code: 'ru',
        file: 'ru-RU.js',
        language: 'ru-RU',
      },
    ],
    strategy: 'no_prefix',
    vueI18n: '../i18n/i18n.config.ts',
  },

  icon: {
    clientBundle: {
      collections: ['lucide', 'mdi'],
      icons: categoryIcons.flat(),
      scan: true,
    },
  },

  modules: [
    '@nuxtjs/i18n',
    '@pinia/nuxt',
    '@vite-pwa/nuxt',
    '@vueuse/nuxt',
    '@nuxt/ui',
    '@nuxt/eslint',
  ],

  // Pre-render the SPA shell so the service worker can precache it
  // for offline navigation (navigateFallback: '/')
  nitro: {
    prerender: {
      routes: ['/'],
    },
  },

  pages: {
    pattern: ['**/*.vue', '!**/_/**'],
  },

  pwa: {
    client: {
      installPrompt: true,
      registerPlugin: true,
    },
    devOptions: {
      enabled: false,
      navigateFallback: '/',
      suppressWarnings: false,
    },
    manifest: {
      background_color: '#171717',
      display: 'standalone',
      icons: [{
        sizes: '192x192',
        src: 'pwa-192x192.png',
        type: 'image/png',
      }, {
        sizes: '512x512',
        src: 'pwa-512x512.png',
        type: 'image/png',
      }, {
        purpose: 'any',
        sizes: '512x512',
        src: 'pwa-512x512.png',
        type: 'image/png',
      }, {
        purpose: 'maskable',
        sizes: '192x192',
        src: 'pwa-192x192.png',
        type: 'image/png',
      }],
      id: '/',
      name: 'Finapp',
      screenshots: [{
        form_factor: 'wide',
        sizes: '1920x1080',
        src: 'screenshot-desktop.png',
        type: 'image/png',
      }, {
        form_factor: 'narrow',
        sizes: '750x1334',
        src: 'screenshot-mobile.png',
        type: 'image/png',
      }],
      short_name: 'Finapp',
      start_url: '/dashboard',
      theme_color: '#171717',
    },
    registerType: 'autoUpdate',
    workbox: {
      globIgnores: ['**/200*', '**/404*'],
      globPatterns: ['**/*.{js,json,css,html,png,svg,ico,woff2}'],
      navigateFallback: '/',
      runtimeCaching: [
        {
          handler: 'CacheFirst',
          options: {
            cacheableResponse: { statuses: [0, 200] },
            cacheName: 'iconify',
            expiration: { maxEntries: 500 },
          },
          urlPattern: /^https:\/\/api\.iconify\.design\/.*/,
        },
        {
          handler: 'CacheFirst',
          options: {
            cacheableResponse: { statuses: [0, 200] },
            cacheName: 'google-fonts',
            expiration: { maxEntries: 30 },
          },
          urlPattern: /^https:\/\/fonts\.(googleapis|gstatic)\.com\/.*/,
        },
      ],
    },
  },

  runtimeConfig: {
    public: {
      convexSiteUrl: process.env.VITE_CONVEX_SITE_URL,
      convexUrl: process.env.VITE_CONVEX_URL,
    },
  },

  ssr: false,
  telemetry: false,
})
