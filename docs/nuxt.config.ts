export default defineNuxtConfig({
  compatibilityDate: '2026-07-30',
  i18n: {
    defaultLocale: 'en',
    locales: [{
      code: 'en',
      name: 'English',
    }, {
      code: 'ru',
      name: 'Русский',
    }],
  },
  modules: ['@nuxtjs/i18n'],
  nitro: {
    prerender: {
      failOnError: true,
    },
  },
})
