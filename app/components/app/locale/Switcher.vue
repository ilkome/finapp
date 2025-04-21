<script setup lang="ts">
import { saveData } from '~~/services/firebase/api'

import type { LocaleSlug } from '~/components/app/locale/types'

import { useUserStore } from '~/components/user/useUserStore'

const props = defineProps<{
  isShowTitle?: boolean
}>()

const { locale, setLocale, t } = useI18n()
const userStore = useUserStore()

const options = [{
  label: t('locale.ru'),
  value: 'ru',
}, {
  label: t('locale.en'),
  value: 'en',
}, {
  label: t('locale.zh'),
  value: 'zh',
}]

function changeLocale(locale: LocaleSlug) {
  setLocale(locale)

  if (!userStore.uid)
    return

  saveData(`users/${userStore.uid}/settings/lang`, locale)
}
</script>

<template>
  <div>
    <UiTitle3
      v-if="props.isShowTitle"
      class="pb-2"
    >
      {{ t('locale.title') }}
    </UiTitle3>

    <FormSelect
      :options
      :value="locale"
      @change="(locale: LocaleSlug) => changeLocale(locale)"
    />
  </div>
</template>

<i18n lang="yaml">
en:
  locale:
    en: 'English'
    ru: 'Русский'
    zh: '中文'
    title: 'Language'
ru:
  locale:
    en: 'English'
    ru: 'Русский'
    zh: '中文'
    title: 'Язык'

zh:
  locale:
    en: 'English'
    ru: 'Русский'
    zh: '中文'
    title: '语言'
</i18n>
