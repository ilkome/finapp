export default defineI18nConfig(() => {
  return {
    defaultLocale: 'en',
    detectBrowserLanguage: {
      cookieKey: 'i18n_redirected',
      useCookie: true,
    },
    fallbackLocale: 'en',
    langDir: 'locales/',
    lazy: true,
    legacy: false,
    locale: 'en',
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
  }
})
