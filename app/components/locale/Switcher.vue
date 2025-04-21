<script setup lang="ts">
import { saveData } from '~~/services/firebase/api'

import type { LocaleSlug } from '~/components/locale/types'

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
    <template v-if="props.isShowTitle">
      <UiTitle3
        class="pb-2"
      >
        {{ t('locale.title') }}
      </UiTitle3>

      <FormSelect
        :options
        :value="locale"
        @change="(locale: LocaleSlug) => changeLocale(locale)"
      />
    </template>

    <UButton
      v-else
      icon="lucide:languages"
      color="neutral"
      variant="ghost"
      square
      aria-label="Locale switcher"
      size="lg"
      @click="changeLocale(locale === 'ru' ? 'en' : 'ru')"
    />
  </div>
</template>

<i18n lang="yaml">
en:
  locale:
    en: 'English'
    ru: 'Русский'
    title: 'Language'
ru:
  locale:
    en: 'English'
    ru: 'Русский'
    title: 'Язык'
</i18n>
