export default defineNuxtConfig({
  devtools: {
    enabled: true,
  },

  runtimeConfig: {
    public: {
      ratesApiKey: process.env.OPEN_EXCHANGE_RATES,
    },
  },

  ssr: false,
  telemetry: false,

  vite: {
    resolve: {
      alias: {
        '~/': './',
      },
    },
  },

  app: {
    head: {
      titleTemplate: '%s - Finapp',
      meta: [
        { charset: 'utf-8' },
        { name: 'viewport', content: 'width=device-width, initial-scale=1' },
        { hid: 'description', name: 'description', content: process.env.npm_package_description || '' },
      ],

      link: [{
        rel: 'stylesheet',
        href: 'https://fonts.googleapis.com/css?family=Roboto:400,500,600,700|Unica+One&display=swap&subset=cyrillic',
      }, {
        rel: 'stylesheet',
        href: 'https://cdn.materialdesignicons.com/5.9.55/css/materialdesignicons.min.css',
      }],

      noscript: [{ innerHTML: 'This website requires JavaScript.' }],
    },
  },

  components: [{
    path: '~/components/',
    extensions: ['vue'],
    global: true,
  }],

  plugins: [
    { src: '~/plugins/initApp' },
    { src: '~/plugins/dayjs' },
    { src: '~/plugins/notifications' },
  ],

  colorMode: {
    classSuffix: '',
    preference: 'system',
  },

  tailwindcss: {
    viewer: false,
  },

  router: {
    // middleware: ['auth'],
  },

  modules: [
    '@nuxtjs/color-mode',
    '@nuxtjs/i18n',
    '@nuxtjs/tailwindcss',
    '@pinia/nuxt',
    '@vite-pwa/nuxt',
    'floating-vue/nuxt',
  ],

  i18n: {
    locales: [{
      code: 'en',
      iso: 'en-US',
      file: 'en-US.js',
    }, {
      code: 'ru',
      iso: 'ru-RU',
      file: 'ru-RU.js',
    }],
    strategy: 'no_prefix',
    defaultLocale: 'en',
    detectBrowserLanguage: {
      useCookie: true,
      cookieKey: 'i18n_redirected',
    },
    lazy: true,
    langDir: 'locales/',
  },

  pwa: {
    strategies: process.env.SW === 'true' ? 'injectManifest' : 'generateSW',
    srcDir: process.env.SW === 'true' ? 'service-worker' : undefined,
    filename: process.env.SW === 'true' ? 'sw.ts' : undefined,
    registerType: 'autoUpdate',
    manifest: {
      name: 'Finapp',
      short_name: 'Finapp',
      theme_color: '#171717',
      background_color: '#171717',
      icons: [
        {
          src: 'pwa-192x192.png',
          sizes: '192x192',
          type: 'image/png',
        },
        {
          src: 'pwa-512x512.png',
          sizes: '512x512',
          type: 'image/png',
        },
        {
          src: 'pwa-512x512.png',
          sizes: '512x512',
          type: 'image/png',
          purpose: 'any maskable',
        },
      ],
    },
    workbox: {
      globPatterns: ['**/*.{js,css,html,png,svg,ico}'],
      runtimeCaching: [{
        urlPattern: 'https://fonts.googleapis.com/',
        handler: 'CacheFirst',
      }, {
        urlPattern: 'https://fonts.gstatic.com/',
        handler: 'CacheFirst',
      }, {
        urlPattern: 'https://cdn.materialdesignicons.com/',
        handler: 'CacheFirst',
      }],
    },
    injectManifest: {
      globPatterns: ['**/*.{js,css,html,png,svg,ico}'],
    },
    client: {
      installPrompt: true,
    },
    devOptions: {
      enabled: true,
      suppressWarnings: true,
      navigateFallback: '/',
      navigateFallbackAllowlist: [/^\/$/],
      type: 'module',
    },
  },
})
