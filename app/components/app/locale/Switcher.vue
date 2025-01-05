<script setup lang="ts">
import { saveData } from '~~/services/firebase/api'

import type { LocaleSlug } from '~/components/app/locale/types'

import { useUserStore } from '~/components/user/useUserStore'

const { locale, setLocale, t } = useI18n()
const userStore = useUserStore()

const locales: { localeKey: string, slug: LocaleSlug }[] = [{
  localeKey: 'app.locale.ru',
  slug: 'ru',
}, {
  localeKey: 'app.locale.en',
  slug: 'en',
}]

function changeLocale(locale: LocaleSlug) {
  setLocale(locale)

  if (!userStore.uid)
    return

  saveData(`users/${userStore.uid}/settings/lang`, locale)
}
</script>

<template>
  <UiTabs3>
    <UiTabsItem2
      v-for="item in locales"
      :key="item.slug"
      :isActive="item.slug === locale"
      @click="changeLocale(item.slug)"
    >
      {{ t(item.localeKey) }}
    </UiTabsItem2>
  </UiTabs3>
</template>
