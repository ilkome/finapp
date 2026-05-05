import { dirname, join } from 'node:path'
import process from 'node:process'
import { fileURLToPath } from 'node:url'

import categoryIcons from './app/assets/js/icons.js'

const currentDir = dirname(fileURLToPath(import.meta.url))

export default defineNuxtConfig({
  app: {
    head: {
      htmlAttrs: { lang: 'en' },
      link: [
        { href: '/favicon.svg', rel: 'icon', type: 'image/svg+xml' },
        { href: '/favicon.png', rel: 'icon', type: 'image/png' },
        { href: 'https://finapp.ilko.me/', rel: 'canonical' },
      ],
      meta: [
        { content: 'Open-source personal finance app. Track expenses, manage wallets, and analyze your spending. Works offline, syncs across devices.', name: 'description' },
        { content: 'Personal Finance Manager', property: 'og:title' },
        { content: 'Your money, your control - anywhere, anytime. Track expenses, manage wallets, analyze spending. Works offline, syncs across devices.', property: 'og:description' },
        { content: 'website', property: 'og:type' },
        { content: 'Finapp', property: 'og:site_name' },
        { content: 'https://finapp.ilko.me/', property: 'og:url' },
        { content: 'https://finapp.ilko.me/og-image.png', property: 'og:image' },
        { content: '1200', property: 'og:image:width' },
        { content: '630', property: 'og:image:height' },
        { content: 'image/png', property: 'og:image:type' },
        { content: 'Finapp dashboard with expense and income analytics', property: 'og:image:alt' },
        { content: 'en_US', property: 'og:locale' },
        { content: 'summary_large_image', name: 'twitter:card' },
        { content: 'Personal Finance Manager', name: 'twitter:title' },
        { content: 'Your money, your control - anywhere, anytime. Track expenses, manage wallets, analyze spending. Works offline, syncs across devices.', name: 'twitter:description' },
        { content: 'https://finapp.ilko.me/og-image.png', name: 'twitter:image' },
        { content: 'Finapp dashboard with expense and income analytics', name: 'twitter:image:alt' },
      ],
      title: 'Personal Finance Manager',
    },
  },

  colorMode: {
    classSuffix: '',
    fallback: 'dark',
    preference: 'system',
  },

  compatibilityDate: '2024-07-07',
  css: [join(currentDir, './app/assets/css/main.css')],

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
      icons: categoryIcons.flat(),
      scan: true,
    },
    collections: ['lucide', 'mdi'],
  },

  modules: [
    '@nuxtjs/i18n',
    '@pinia/nuxt',
    '@vite-pwa/nuxt',
    '@vueuse/nuxt',
    '@nuxt/ui',
    '@nuxt/eslint',
  ],

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
        {
          handler: 'CacheFirst',
          options: {
            cacheableResponse: { statuses: [0, 200] },
            cacheName: 'user-avatars',
            expiration: { maxAgeSeconds: 60 * 60 * 24 * 30, maxEntries: 20 },
          },
          urlPattern: /^https:\/\/lh3\.googleusercontent\.com\/.*/,
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

  vite: {
    optimizeDeps: {
      include: [
        'localforage',
        '@convex-dev/better-auth/client/plugins',
        'better-auth/vue',
        'date-fns',
        'convex/browser',
        'zod/v4',
        'es-toolkit',
        'convex/server',
        '@internationalized/date',
        'date-fns/locale',
      ],
    },
  },
})
