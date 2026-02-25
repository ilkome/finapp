import process from 'node:process'

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
    '@nuxt/eslint',
  ],

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
      navigateFallbackAllowlist: [/^\/$/],
      suppressWarnings: false,
      type: 'module',
    },
    filename: 'sw.ts',
    injectManifest: {
      globIgnores: ['**/200*', '**/404*'],
      globPatterns: ['**/*.{js,json,css,html,png,svg,ico,woff2}'],
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
    srcDir: 'service-worker',
    strategies: 'injectManifest',
  },

  runtimeConfig: {
    public: {
      convexSiteUrl: process.env.VITE_CONVEX_SITE_URL,
      convexUrl: process.env.VITE_CONVEX_URL,
    },
  },

  ssr: true,
  telemetry: false,
})
