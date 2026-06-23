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
      icons: [
        ...categoryIcons.flat(),
        // Runtime iconify fetches pop in after first paint and shift layout.
        'hugeicons:archive-01',
        'hugeicons:bank',
        'hugeicons:calendar-03',
        'hugeicons:chart-histogram',
        'hugeicons:folder-library',
        'hugeicons:laptop-programming',
        'hugeicons:menu-01',
        'hugeicons:money-exchange-01',
        'hugeicons:plus-sign-square',
        'hugeicons:settings-01',
        'hugeicons:wallet-01',
        'lucide:chart-no-axes-combined',
        'lucide:folder',
        'lucide:folder-open',
        'lucide:folder-open-dot',
        'lucide:folder-tree',
        'lucide:loader-circle',
        'lucide:network',
      ],
      scan: true,
    },
    collections: ['hugeicons', 'lucide', 'mdi'],
  },

  modules: [
    '@nuxtjs/i18n',
    '@pinia/nuxt',
    '@vite-pwa/nuxt',
    '@vueuse/nuxt',
    '@nuxt/ui',
    '@nuxt/eslint',
  ],

  nitro: {
    hooks: {
      // Make the sizable entry Tailwind stylesheet non-render-blocking so the SPA loading
      // skeleton (inline-styled) paints on HTML arrival instead of waiting for that CSS to
      // download. The app itself renders only after its JS bundle executes - slower than the
      // CSS fetch - so styles are in place by mount (no FOUC); <noscript> keeps it blocking
      // when JS is off. Rewrites the statically generated HTML (index/200/404).
      'prerender:generate': (route: { contents?: string, fileName?: string }) => {
        if (typeof route.contents !== 'string' || !route.fileName?.endsWith('.html'))
          return
        route.contents = route.contents.replace(
          /<link rel="stylesheet" href="([^"]+)"([^>]*)>/g,
          (_m, href, rest) =>
            `<link rel="stylesheet" href="${href}"${rest} media="print" onload="this.media='all'"><noscript><link rel="stylesheet" href="${href}"${rest}></noscript>`,
        )
      },
    },
    preset: 'static',
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
      importScripts: ['/sw-push.js'],
      globIgnores: ['**/200*', '**/404*'],
      // The wa-sqlite WASM must be precached or the offline-first start breaks in prod; it sits
      // just over Workbox's 2 MiB default cap (hence the raised limit below), which would otherwise
      // drop it silently. Only the variant the worker actually loads is precached: the async
      // non-cipher build, dot-hash name (`wa-sqlite-async.<hash>.wasm`). The other emitted variants
      // (sync builds, `mc-` cipher builds - used only with an encryptionKey, which db.ts does not set
      // - and dash-hash duplicates) together would add several MB to every SW install.
      // The manifestTransforms guard below fails the build if the precache entry ever stops matching
      // (e.g. an upstream rename), so this never regresses to a broken offline start unnoticed.
      globPatterns: ['**/*.{js,json,css,html,png,svg,ico,woff2}', '**/wa-sqlite-async.*.wasm'],
      manifestTransforms: [(entries) => {
        const hasWasm = entries.some(e => /wa-sqlite-async\..*\.wasm$/.test(e.url))
        if (!hasWasm)
          throw new Error('PWA precache manifest is missing the wa-sqlite WASM - offline-first start would break in prod. Check the wasm filename/glob in nuxt.config.ts.')
        return { manifest: entries }
      }],
      maximumFileSizeToCacheInBytes: 3 * 1024 * 1024,
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
      powersyncUrl: process.env.VITE_POWERSYNC_URL,
      supabaseAnonKey: process.env.VITE_SUPABASE_ANON_KEY,
      supabaseUrl: process.env.VITE_SUPABASE_URL,
      vapidPublicKey: process.env.VITE_VAPID_PUBLIC_KEY,
    },
  },

  ssr: false,

  telemetry: false,

  vite: {
    optimizeDeps: {
      // @powersync/web ships web workers + WASM that must not be pre-bundled.
      exclude: ['@powersync/web'],
      include: [
        'localforage',
        '@supabase/supabase-js',
        'date-fns',
        'zod/v4',
        'es-toolkit',
        '@internationalized/date',
        'date-fns/locale',
        'reka-ui',
        'reka-ui/namespaced',
      ],
    },
    worker: {
      format: 'es',
    },
  },
})
