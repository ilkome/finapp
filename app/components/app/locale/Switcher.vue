<script setup lang="ts">
import { saveData } from '../../../../services/firebase/api'
import { useUserStore } from '~/components/user/useUser'

const { locale, setLocale } = useI18n()
const userStore = useUserStore()

const locales = [{
  localeKey: 'app.locale.ru',
  slug: 'ru',
}, {
  localeKey: 'app.locale.en',
  slug: 'en',
}]

function changeLocale(locale: string) {
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
      {{ $t(item.localeKey) }}
    </UiTabsItem2>
  </UiTabs3>
</template>
