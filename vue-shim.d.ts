import type { NuxtI18nInstance } from '@nuxtjs/i18n'

declare module '*.vue' {
  import Vue from 'vue'
  export default Vue
}

declare module 'vue/types/vue' {
  interface Vue {
    i18n: NuxtI18nInstance
  }
}
