import process from 'node:process'

import { config } from './services/firebase/config'

const sw = process.env.SW === 'true'

export default defineNuxtConfig({
  colorMode: {
    classSuffix: '',
    fallback: 'dark',
    preference: 'system',
  },

  compatibilityDate: '2024-07-07',

  components: [
    {
      extensions: ['vue'],
      path: '~/components/',
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
      styles: ['normal'],
      subsets: [
        'cyrillic',
      ],
      weights: [400],
    },
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
      scan: true,
      ssr: true,
    },
    serverBundle: {
      collections: ['lucide', 'mdi'],
    },
  },

  modules: [
    '@nuxtjs/i18n',
    '@pinia/nuxt',
    '@vite-pwa/nuxt',
    '@nuxt/ui',
    'nuxt-vuefire',
    '@nuxt/eslint',
  ],

  plugins: [{ src: '~/plugins/toast' }],

  pwa: {
    client: {
      installPrompt: true,
    },
    devOptions: {
      enabled: false,
      navigateFallback: '/',
      navigateFallbackAllowlist: [/^\/$/],
      suppressWarnings: false,
      type: 'module',
    },
    filename: sw ? 'sw.ts' : undefined,
    injectManifest: {
      globPatterns: ['**/*.{js,css,html,png,svg,ico}'],
    },
    manifest: {
      background_color: '#171717',
      display: 'fullscreen',
      display_override: ['standalone', 'minimal-ui'],
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
    srcDir: sw ? 'service-worker' : undefined,
    strategies: sw ? 'injectManifest' : 'generateSW',

    workbox: {
      globIgnores: ['**/200*', '**/404*'],
      globPatterns: ['**/*.{js,css,html,png,svg,ico,woff2}'],
      runtimeCaching: [{
        handler: 'CacheFirst',
        urlPattern: 'https://api.iconify.design/',
      }, {
        handler: 'CacheFirst',
        urlPattern: 'https://fonts.googleapis.com/',
      }, {
        handler: 'CacheFirst',
        urlPattern: 'https://fonts.gstatic.com/',
      }],
    },
  },

  runtimeConfig: {
    public: {
      ratesApiKey: process.env.OPEN_EXCHANGE_RATES,
    },
  },

  ssr: false,
  telemetry: false,

  vuefire: {
    auth: {
      enabled: true,
    },
    config,
  },
})
