import { defineNuxtConfig } from '@nuxt/bridge'

export default defineNuxtConfig({
  bridge: {
    nitro: false,
    vite: false,
    meta: true,
  },

  // Nuxt3: use this instead of publicRuntimeConfig
  runtimeConfig: {
    public: {
      devEmails: process.env.DEV_EMAILS || [],
      ratesApiKey: process.env.OPEN_EXCHANGE_RATES,
    },
  },

  publicRuntimeConfig: {
    ratesApiKey: process.env.OPEN_EXCHANGE_RATES,
  },

  ssr: false,
  target: 'static',
  telemetry: false,

  vue: {
    config: {
      silent: true,
      performance: false,
      productionTip: false,
      devtools: process.env.NODE_ENV !== 'production',
    },
  },

  head: {
    titleTemplate: '%s - Finapp',
    meta: [
      { charset: 'utf-8' },
      { name: 'viewport', content: 'width=device-width, initial-scale=1' },
      { hid: 'description', name: 'description', content: process.env.npm_package_description || '' },
    ],

    link: [{
      rel: 'stylesheet',
      href: 'https://fonts.googleapis.com/css?family=Roboto:400,500,600,700|Roboto+Condensed:400,500,600,700|Unica+One|Nunito:400,700,800&display=swap&subset=cyrillic',
    }, {
      rel: 'stylesheet',
      href: 'https://cdn.materialdesignicons.com/5.9.55/css/materialdesignicons.min.css',
    }],

    noscript: [{ innerHTML: 'This website requires JavaScript.' }],
  },

  styleResources: {
    stylus: ['~/assets/stylus/variables'],
  },

  components: [{
    path: '~/components/',
    extensions: ['vue'],
  }],

  loading: false,

  plugins: [
    { src: '~/plugins/initApp' },
    { src: '~/plugins/dayjs' },
    { src: '~/plugins/notifications' },
  ],

  colorMode: {
    classSuffix: '',
    preference: 'system',
  },

  modules: [
    '@nuxtjs/color-mode',
    '@nuxtjs/i18n',
    '@nuxtjs/pwa',
    '@pinia/nuxt',
    'portal-vue/nuxt',
  ],

  buildModules: [
    '@nuxtjs/pwa',
    '@nuxtjs/style-resources',
    '@nuxtjs/tailwindcss',
  ],

  alias: {
    tslib: 'tslib/tslib.es6.js',
  },

  tailwindcss: {
    viewer: false,
  },

  router: {
    middleware: ['auth'],
  },

  pinia: {
    autoImports: [
      'defineStore',
      ['defineStore', 'definePiniaStore'],
    ],
    disableVuex: false,
  },

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
    seo: false,
    lazy: true,
    vueI18nLoader: true,
    langDir: 'locales/',
  },

  pwa: {
    manifest: {
      name: 'Finapp',
      id: '/?standalone=true',
      short_name: 'Finapp',
      background_color: '#171717',
      theme_color: '#171717',
    },

    workbox: {
      offlineStrategy: 'cacheFirst',
      runtimeCaching: [{
        urlPattern: 'https://fonts.googleapis.com/',
        handler: 'cacheFirst',
      }, {
        urlPattern: 'https://fonts.gstatic.com/',
        handler: 'cacheFirst',
      }, {
        urlPattern: 'https://cdn.materialdesignicons.com/',
        handler: 'cacheFirst',
      }],
    },
  },
})
