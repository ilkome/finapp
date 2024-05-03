export default defineNuxtConfig({
  app: {
    head: {
      link: [{
        href: 'https://fonts.googleapis.com/css?family=Roboto+Mono:400,500|Roboto:400,500,600,700|Unica+One&display=swap&subset=cyrillic',
        rel: 'stylesheet',
      }, {
        href: 'https://cdn.materialdesignicons.com/5.9.55/css/materialdesignicons.min.css',
        rel: 'stylesheet',
      }],
      meta: [
        { charset: 'utf-8' },
        { content: 'width=device-width, initial-scale=1', name: 'viewport' },
        { content: process.env.npm_package_description || '', hid: 'description', name: 'description' },
      ],

      noscript: [{ innerHTML: 'This website requires JavaScript.' }],

      titleTemplate: '%s - Finapp',
    },
  },

  colorMode: {
    classSuffix: '',
    preference: 'system',
  },

  components: [{
    extensions: ['vue'],
    global: true,
    path: '~/components/',
  }],

  devtools: {
    timeline: {
      // enabled: true,
    },
  },

  i18n: {
    defaultLocale: 'en',
    detectBrowserLanguage: {
      cookieKey: 'i18n_redirected',
      useCookie: true,
    },
    langDir: 'locales/',
    lazy: true,
    locales: [{
      code: 'en',
      file: 'en-US.js',
      iso: 'en-US',
    }, {
      code: 'ru',
      file: 'ru-RU.js',
      iso: 'ru-RU',
    }],
    strategy: 'no_prefix',
  },

  modules: [
    '@nuxtjs/color-mode',
    '@nuxtjs/i18n',
    '@nuxtjs/tailwindcss',
    '@pinia/nuxt',
    '@vite-pwa/nuxt',
    'floating-vue/nuxt',
  ],

  plugins: [
    { src: '~/plugins/initApp' },
    { src: '~/plugins/dayjs' },
    { src: '~/plugins/toast' },
  ],

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
    filename: process.env.SW === 'true' ? 'sw.ts' : undefined,
    injectManifest: {
      globPatterns: ['**/*.{js,css,html,png,svg,ico}'],
    },
    manifest: {
      background_color: '#171717',
      icons: [{
        sizes: '192x192',
        src: 'pwa-192x192.png',
        type: 'image/png',
      }, {
        sizes: '512x512',
        src: 'pwa-512x512.png',
        type: 'image/png',
      }, {
        purpose: 'any maskable',
        sizes: '512x512',
        src: 'pwa-512x512.png',
        type: 'image/png',
      }],
      name: 'Finapp',
      short_name: 'Finapp',
      theme_color: '#171717',
    },
    registerType: 'autoUpdate',
    srcDir: process.env.SW === 'true' ? 'service-worker' : undefined,
    strategies: process.env.SW === 'true' ? 'injectManifest' : 'generateSW',
    workbox: {
      globPatterns: ['**/*.{js,css,html,png,svg,ico}'],
      runtimeCaching: [{
        handler: 'CacheFirst',
        urlPattern: 'https://fonts.googleapis.com/',
      }, {
        handler: 'CacheFirst',
        urlPattern: 'https://fonts.gstatic.com/',
      }, {
        handler: 'CacheFirst',
        urlPattern: 'https://cdn.materialdesignicons.com/',
      }],
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

  vite: {
    resolve: {
      alias: {
        '~/': './',
      },
    },
  },
})
