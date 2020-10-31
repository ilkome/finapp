export default {
  publicRuntimeConfig: {
    testerEmail: 'ilya.komichev@gmail.com'
  },

  /**
   * https://nuxtjs.org/guides/configuration-glossary/configuration-ssr
   */
  ssr: false,

  /**
   * https://nuxtjs.org/guides/configuration-glossary/configuration-modern
   */
  modern: 'client',

  /**
   * https://nuxtjs.org/guides/configuration-glossary/configuration-target
   */
  target: 'server',

  /**
   * https://nuxtjs.org/guides/configuration-glossary/configuration-telemetry
   */
  telemetry: false,

  /**
   * https://nuxtjs.org/guides/configuration-glossary/configuration-vue-config
   */
  vue: {
    config: {
      silent: true,
      performance: false,
      productionTip: false,
      devtools: process.env.NODE_ENV !== 'production'
    }
  },

  /**
   * Headers of the page
   * https://nuxtjs.org/api/configuration-head
   */
  head: {
    title: 'Finapp',
    meta: [
      { charset: 'utf-8' },
      { name: 'viewport', content: 'width=device-width, initial-scale=1' },
      { hid: 'description', name: 'description', content: process.env.npm_package_description || '' }
    ],
    link: [{
      rel: 'stylesheet',
      href: 'https://fonts.googleapis.com/css?family=Roboto+Condensed:400,700|Unica+One|Nunito:400,700,800&display=swap&subset=cyrillic'
    }, {
      rel: 'stylesheet',
      href: 'https://cdn.materialdesignicons.com/5.0.45/css/materialdesignicons.min.css'
    }, {
      rel: 'stylesheet',
      href: 'https://maxcdn.bootstrapcdn.com/font-awesome/4.7.0/css/font-awesome.min.css'
    }],

    noscript: [{ innerHTML: 'This website requires JavaScript.' }]
  },

  /**
   * Global CSS
   */
  css: [
    { src: '~/assets/stylus/index.styl' }
  ],

  /**
   * Auto import components
   * https://nuxtjs.org/api/configuration-components
   */
  components: true,

  /**
   * Plugins to load before mounting the App
   * https://nuxtjs.org/guide/plugins
   */
  plugins: [
    { src: '~/plugins/initAppFromCache' },
    { src: '~/plugins/dayjs' },
    { src: '~/plugins/notifications' }
  ],

  loading: false,

  /**
   * Nuxt.js dev-modules
   */
  buildModules: [
    '@nuxtjs/color-mode',
    '@nuxtjs/pwa',
    'nuxt-composition-api'
  ],

  /**
   * Color mode
   */
  colorMode: {
    preference: 'system', // default value of $colorMode.preference
    fallback: 'dark' // fallback value if not system preference found
  },

  /**
   * Nuxt.js modules
   */
  modules: [
    '@nuxtjs/pwa',
    'portal-vue/nuxt',
    'nuxt-i18n'
  ],

  /**
   * Axios module configuration
   * https://axios.nuxtjs.org/options
   */
  axios: {},

  /*
  ** Router middleware
  */
  router: {
    middleware: [
      'auth'
    ]
  },

  /**
   * nuxt-i18n module configuration
   * https://i18n.nuxtjs.org/
   */
  i18n: {
    locales: [{
      code: 'en',
      file: 'en-US.js'
    }, {
      code: 'ru',
      file: 'ru-RU.js'
    }],
    strategy: 'no_prefix',
    defaultLocale: 'en',
    detectBrowserLanguage: {
      useCookie: true,
      cookieKey: 'i18n_redirected',
      alwaysRedirect: false
    },
    seo: false,
    lazy: true,
    langDir: 'locales/'
  },

  /**
   * Manifest
   */
  pwa: {
    manifest: {
      name: 'Finapp',
      short_name: 'Finapp',
      background_color: '#121212',
      theme_color: '#121212'
    },

    workbox: {
      offlineStrategy: 'cacheFirst',
      runtimeCaching: [{
        urlPattern: 'https://fonts.googleapis.com/',
        handler: 'cacheFirst'
      }, {
        urlPattern: 'https://fonts.gstatic.com/',
        handler: 'cacheFirst'
      }, {
        urlPattern: 'https://maxcdn.bootstrapcdn.com/',
        handler: 'cacheFirst'
      }, {
        urlPattern: 'https://cdnjs.cloudflare.com/',
        handler: 'cacheFirst'
      }, {
        urlPattern: 'https://netdna.bootstrapcdn.com/',
        handler: 'cacheFirst'
      }, {
        urlPattern: 'https://cdn.materialdesignicons.com/',
        handler: 'cacheFirst'
      }]
    }
  }
}
