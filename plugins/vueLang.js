import Vue from 'vue'
import Lang from 'vue-lang'

const locales = {
  en: require('~/locales/en.json'),
  ru: require('~/locales/ru.json')
}

Vue.use(Lang, { lang: 'en', locales })
