import { readdirSync, readFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import process from 'node:process'
import { fileURLToPath } from 'node:url'

import categoryIcons from './app/assets/js/icons.js'

const currentDir = dirname(fileURLToPath(import.meta.url))
const powerSyncWasmDir = join(currentDir, 'node_modules/@powersync/web/dist/worker/assets')
const powerSyncWasmFiles = readdirSync(powerSyncWasmDir).filter(file => file.endsWith('.wasm'))

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
        {
          content:
            'Open-source personal finance app. Track expenses, manage wallets, and analyze your spending. Works offline, syncs across devices.',
          name: 'description',
        },
        { content: 'Personal Finance Manager', property: 'og:title' },
        {
          content:
            'Your money, your control - anywhere, anytime. Track expenses, manage wallets, analyze spending. Works offline, syncs across devices.',
          property: 'og:description',
        },
        { content: 'website', property: 'og:type' },
        { content: 'Finapp', property: 'og:site_name' },
        { content: 'https://finapp.ilko.me/', property: 'og:url' },
        {
          content: 'https://finapp.ilko.me/og-image.png',
          property: 'og:image',
        },
        { content: '1200', property: 'og:image:width' },
        { content: '630', property: 'og:image:height' },
        { content: 'image/png', property: 'og:image:type' },
        {
          content: 'Finapp dashboard with expense and income analytics',
          property: 'og:image:alt',
        },
        { content: 'en_US', property: 'og:locale' },
        { content: 'summary_large_image', name: 'twitter:card' },
        { content: 'Personal Finance Manager', name: 'twitter:title' },
        {
          content:
            'Your money, your control - anywhere, anytime. Track expenses, manage wallets, analyze spending. Works offline, syncs across devices.',
          name: 'twitter:description',
        },
        {
          content: 'https://finapp.ilko.me/og-image.png',
          name: 'twitter:image',
        },
        {
          content: 'Finapp dashboard with expense and income analytics',
          name: 'twitter:image:alt',
        },
      ],
      style: [
        {
          innerHTML:
            'html{background:#fff;color-scheme:light dark}@media(prefers-color-scheme:dark){html{background:#171717}}',
        },
      ],
      title: 'Personal Finance Manager',
    },
  },
  colorMode: {
    classSuffix: '',
    fallback: 'dark',
    preference: 'system',
  },
  compatibilityDate: '2026-07-30',

  css: [join(currentDir, './app/assets/css/main.css')],

  devtools: {
    enabled: true,
    timeline: {
      enabled: false,
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
        'lucide:book-open',
        'lucide:check',
        'lucide:chart-no-axes-combined',
        'lucide:chevron-left',
        'lucide:chevron-right',
        'lucide:external-link',
        'lucide:folder',
        'lucide:folder-open',
        'lucide:folder-open-dot',
        'lucide:folder-tree',
        'lucide:languages',
        'lucide:loader-circle',
        'lucide:log-out',
        'lucide:menu',
        'lucide:monitor',
        'lucide:moon',
        'lucide:network',
        'lucide:paintbrush',
        'lucide:palette',
        'lucide:square-arrow-out-up-right',
        'lucide:square-round-corner',
        'lucide:sun',
        'lucide:swatch-book',
        'mdi:github',
        'mdi:play-box-outline',
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
    prerender: {
      autoSubfolderIndex: false,
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
      navigateFallback: '/index.html',
      suppressWarnings: false,
    },
    manifest: {
      background_color: '#171717',
      display: 'standalone',
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
          purpose: 'any',
          sizes: '512x512',
          src: 'pwa-512x512.png',
          type: 'image/png',
        },
        {
          purpose: 'maskable',
          sizes: '192x192',
          src: 'pwa-192x192.png',
          type: 'image/png',
        },
      ],
      id: '/',
      name: 'Finapp',
      screenshots: [
        {
          form_factor: 'wide',
          sizes: '1920x1080',
          src: 'screenshot-desktop.png',
          type: 'image/png',
        },
        {
          form_factor: 'narrow',
          sizes: '750x1334',
          src: 'screenshot-mobile.png',
          type: 'image/png',
        },
      ],
      short_name: 'Finapp',
      start_url: '/dashboard',
      theme_color: '#171717',
    },
    registerType: 'autoUpdate',
    workbox: {
      globIgnores: ['**/200*', '**/404*'],
      globPatterns: [
        '**/*.{js,json,css,html,png,svg,ico,woff2}',
        '**/*.wasm',
      ],
      importScripts: ['/sw-push.js'],
      manifestTransforms: [
        (entries) => {
          const hasWasm = entries.some(e =>
            /powersync-assets\/wa-sqlite-async-.*\.wasm$/.test(e.url),
          )
          if (!hasWasm) {
            throw new Error(
              'PWA precache manifest is missing the wa-sqlite WASM - offline-first start would break in prod. Check the wasm filename/glob in nuxt.config.ts.',
            )
          }
          return { manifest: entries }
        },
      ],
      maximumFileSizeToCacheInBytes: 3 * 1024 * 1024,
      navigateFallback: '/index.html',
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
      // Vercel sets VERCEL_ENV=production only for the main-branch prod deploy;
      // absent locally, 'preview' for branch deploys.
      isProd: process.env.VERCEL_ENV === 'production',
      powersyncUrl: process.env.VITE_POWERSYNC_URL,
      supabaseAnonKey: process.env.VITE_SUPABASE_ANON_KEY,
      supabaseUrl: process.env.VITE_SUPABASE_URL,
      vapidPublicKey: process.env.VITE_VAPID_PUBLIC_KEY,
    },
  },

  spaLoadingTemplate: false,
  ssr: false,
  telemetry: false,

  vite: {
    optimizeDeps: {
      // Keep PowerSync's main thread and shared workers on the same module graph. Mixing
      // source-loaded @powersync/web with optimized transitive modules can leave a dev
      // shared worker connected to clients from an obsolete Vite dependency generation.
      exclude: [
        '@powersync/common',
        '@powersync/shared-internals',
        '@powersync/web',
        'comlink',
      ],
      include: [
        'localforage',
        '@supabase/supabase-js',
        'date-fns',
        'date-fns/locale',
        '@date-fns/utc',
        'zod/v4',
        'es-toolkit',
        '@internationalized/date',
        'reka-ui',
        'reka-ui/namespaced',
        'echarts/core',
        'echarts/charts',
        'echarts/components',
        'echarts/renderers',
        'vue-echarts',
        'motion-v',
        'clsx',
        'tailwind-merge',
        'tailwindcss/colors',
        'swiper',
        'swiper/modules',
      ],
    },
    plugins: [
      {
        apply: 'build',
        generateBundle() {
          for (const file of powerSyncWasmFiles) {
            this.emitFile({
              fileName: `_nuxt/powersync-assets/${file}`,
              source: readFileSync(join(powerSyncWasmDir, file)),
              type: 'asset',
            })
          }
        },
        name: 'powersync-wasm-assets',
        renderChunk(code) {
          let rendered = code
          for (const file of powerSyncWasmFiles)
            rendered = rendered.replaceAll(`assets/${file}`, `powersync-assets/${file}`)
          return rendered === code ? null : { code: rendered, map: null }
        },
      },
    ],
    worker: {
      format: 'es',
      plugins: () => [
        {
          name: 'powersync-wasm-paths',
          renderChunk(code) {
            let rendered = code
            for (const file of powerSyncWasmFiles)
              rendered = rendered.replaceAll(`assets/${file}`, `powersync-assets/${file}`)
            return rendered === code ? null : { code: rendered, map: null }
          },
        },
      ],
    },
  },
})
