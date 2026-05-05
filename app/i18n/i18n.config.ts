import { ruPluralization } from './ruPluralization'

export default defineI18nConfig(() => {
  return {
    // !important
    // https://vue-i18n.intlify.dev/guide/advanced/pluralization.html#custom-pluralization-rules
    // DOCS say use pluralizationRules, but it's not working so use pluralRules
    pluralRules: {
      ru: ruPluralization,
    },
  }
})
