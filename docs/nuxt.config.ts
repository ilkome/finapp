export default defineNuxtConfig({
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
})
