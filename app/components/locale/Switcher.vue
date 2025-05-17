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

    <template v-else>
      <UTooltip :text="t('locale.title')">
        <UButton
          :aria-label="t('locale.title')"
          class="text-muted"
          color="neutral"
          icon="lucide:languages"
          size="lg"
          square
          variant="ghost"
          @click="changeLocale(locale === 'ru' ? 'en' : 'ru')"
        />
      </UTooltip>
    </template>
  </div>
</template>
