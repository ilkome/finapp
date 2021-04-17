export default {
  publicRuntimeConfig: {
    testerEmail: 'ilya.komichev@gmail.com'
  },

  // Disable server-side rendering (https://go.nuxtjs.dev/ssr-mode)
  ssr: false,

  // Target (https://go.nuxtjs.dev/config-target)
  target: 'static',

  // https://nuxtjs.org/guides/configuration-glossary/configuration-modern
  modern: 'client',

  // https://nuxtjs.org/guides/configuration-glossary/configuration-telemetry
  telemetry: false,

  // https://nuxtjs.org/guides/configuration-glossary/configuration-vue-config
  vue: {
    config: {
      silent: true,
      performance: false,
      productionTip: false,
      devtools: process.env.NODE_ENV !== 'production'
    }
  },

  // Global page headers (https://go.nuxtjs.dev/config-head)
  head: {
    title: 'Finapp',
    meta: [
      { charset: 'utf-8' },
      { name: 'viewport', content: 'width=device-width, initial-scale=1' },
      { hid: 'description', name: 'description', content: process.env.npm_package_description || '' }
    ],

    link: [{
      rel: 'stylesheet',
      href: 'https://fonts.googleapis.com/css?family=Roboto:400,500,600,700|Roboto+Condensed:400,500,600,700|Unica+One|Nunito:400,700,800&display=swap&subset=cyrillic'
    }, {
      rel: 'stylesheet',
      href: 'https://cdn.materialdesignicons.com/5.0.45/css/materialdesignicons.min.css'
    }],

    noscript: [{ innerHTML: 'This website requires JavaScript.' }]
  },

  // Global CSS (https://go.nuxtjs.dev/config-css)
  css: [
    { src: '~/assets/stylus/index.styl' }
  ],

  // Auto import components (https://go.nuxtjs.dev/config-components)
  components: [{
    path: '~/components/',
    extensions: ['vue']
  }, {
    path: '~/modules/',
    extensions: ['vue']
  }],

  // Loading
  loading: false,

  // Plugins to run before rendering page (https://go.nuxtjs.dev/config-plugins)
  plugins: [
    { src: '~/plugins/initAppFromCache' },
    { src: '~/plugins/dayjs' },
    { src: '~/plugins/notifications' }
  ],

  // Color mode
  colorMode: {
    preference: 'system', // default value of $colorMode.preference
    fallback: 'dark' // fallback value if not system preference found
  },

  // Style resources
  styleResources: {
    stylus: ['~/assets/stylus/variables']
  },

  // Nuxt.js modules
  modules: [
    '@nuxtjs/color-mode',
    '@nuxtjs/pwa',
    'nuxt-i18n',
    'portal-vue/nuxt'
  ],

  // Modules for dev and build (https://go.nuxtjs.dev/config-modules)
  buildModules: [
    '@nuxtjs/pwa',
    // https://composition-api.nuxtjs.org/
    '@nuxtjs/composition-api/module',
    // https://typescript.nuxtjs.org/
    '@nuxt/typescript-build'
  ],

  // Router middleware
  router: {
    middleware: [
      'auth'
    ]
  },

  // Nuxt-i18n module configuration (https://i18n.nuxtjs.org)
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

  // Manifest
  pwa: {
    manifest: {
      name: 'Finapp',
      short_name: 'Finapp',
      background_color: '#171717',
      theme_color: '#171717'
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
        urlPattern: 'https://cdn.materialdesignicons.com/',
        handler: 'cacheFirst'
      }]
    }
  }
}
