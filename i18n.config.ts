export default defineI18nConfig(() => {
  return {
    legacy: false,
    locale: 'en',
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
    fallbackLocale: 'en',
    detectBrowserLanguage: {
      useCookie: true,
      cookieKey: 'i18n_redirected',
    },
    lazy: true,
    langDir: 'locales/',
  }
})
