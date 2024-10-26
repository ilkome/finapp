import process from 'node:process'
import { config } from './services/firebase/config'

const sw = process.env.SW === 'true'

export default defineNuxtConfig({
  app: {
    head: {
      link: [
        {
          href: '/css/materialdesignicons.min.css',
          rel: 'stylesheet',
        },
        {
          href: '/favicon.png',
          rel: 'icon',
          type: 'image/png',
        },
      ],
      meta: [
        { charset: 'utf-8' },
        { content: 'width=device-width, initial-scale=1', name: 'viewport' },
        {
          content: process.env.npm_package_description || '',
          hid: 'description',
          name: 'description',
        },
      ],

      noscript: [{ innerHTML: 'This website requires JavaScript.' }],
      titleTemplate: '%s - Finapp',
    },
  },

  colorMode: {
    classSuffix: '',
    preference: 'system',
  },

  compatibilityDate: '2024-07-07',

  components: [
    {
      extensions: ['vue'],
      global: true,
      path: '~/components/',
    },
  ],

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
    viewTransition: true,
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
    langDir: 'locales/',
    lazy: true,
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
  },

  modules: [
    '@nuxtjs/i18n',
    '@pinia/nuxt',
    '@vite-pwa/nuxt',
    'nuxt-icon',
    '@nuxt/ui',
    '@nuxt/fonts',
    'nuxt-vuefire',
    '@nuxt/eslint',
  ],

  plugins: [{ src: '~/plugins/dayjs' }, { src: '~/plugins/toast' }],

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
      icons: [
        {
          sizes: '192x192',
          src: 'pwa-192x192.png',
          type: 'image/png',
        },
        {
          sizes: '512x512',
          src: 'pwa-512x512.png',
          type: 'image/png',
        },
        {
          purpose: 'any maskable',
          sizes: '512x512',
          src: 'pwa-512x512.png',
          type: 'image/png',
        },
      ],
      name: 'Finapp',
      short_name: 'Finapp',
      theme_color: '#171717',
    },
    registerType: 'autoUpdate',
    srcDir: sw ? 'service-worker' : undefined,
    strategies: sw ? 'injectManifest' : 'generateSW',

    workbox: {
      globPatterns: ['**/*.{js,css,html,png,svg,ico}'],
      runtimeCaching: [
        {
          handler: 'CacheFirst',
          urlPattern: 'https://fonts.googleapis.com/',
        },
        {
          handler: 'CacheFirst',
          urlPattern: 'https://fonts.gstatic.com/',
        },
        {
          handler: 'CacheFirst',
          urlPattern: 'https://cdn.materialdesignicons.com/',
        },
        {
          handler: 'CacheFirst',
          urlPattern: 'https://api.iconify.design',
        },
      ],
    },
  },

  runtimeConfig: {
    public: {
      ratesApiKey: process.env.OPEN_EXCHANGE_RATES,
    },
  },

  ssr: false,

  tailwindcss: {
    viewer: false,
  },

  telemetry: false,

  ui: {
    gray: 'neutral',
    primary: 'blue',
  },

  vuefire: {
    auth: {
      enabled: true,
    },
    config,
  },
})
