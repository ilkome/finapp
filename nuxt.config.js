export default {
  publicRuntimeConfig: {
    testerEmail: 'ilya.komichev@gmail.com'
  },

  /**
   * Nuxt rendering mode
   * See https://nuxtjs.org/api/configuration-mode
   */
  mode: 'spa',

  /**
   * Headers of the page
   * See https://nuxtjs.org/api/configuration-head
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
      href: 'https://fonts.googleapis.com/css?family=Roboto:400,500,700|Unica+One|Nunito:400,700,800&display=swap&subset=cyrillic'
    }, {
      rel: 'stylesheet',
      href: 'https://cdn.materialdesignicons.com/5.0.45/css/materialdesignicons.min.css'
    }, {
      rel: 'stylesheet',
      href: 'https://maxcdn.bootstrapcdn.com/font-awesome/4.7.0/css/font-awesome.min.css'
    }]
  },

  /**
   * Global CSS
   */
  css: [
    { src: '~/assets/stylus/index.styl' }
  ],

  /**
   * Plugins to load before mounting the App
   * https://nuxtjs.org/guide/plugins
   */
  plugins: [
    { src: '~/plugins/dayjs' },
    { src: '~/plugins/notifications' },
    { src: '~/plugins/vueLang' }
  ],

  /**
   * Nuxt.js dev-modules
   */
  buildModules: [
    '@nuxtjs/color-mode'
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
    '@nuxtjs/pwa'
  ],

  /**
   * Axios module configuration
   * See https://axios.nuxtjs.org/options
   */
  axios: {},

  /**
   * Manifest
   */
  manifest: {
    name: 'Finapp',
    short_name: 'Finapp',
    background_color: '#121212',
    theme_color: '#121212',
    icons: [{
      src: '/icon64.png',
      size: '64x64',
      type: 'image/png'
    }]
  }
}
