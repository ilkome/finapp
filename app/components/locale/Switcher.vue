<script setup lang="ts">
import type { LocaleSlug } from '~/components/locale/types'

import { useUserStore } from '~/components/user/useUserStore'

const props = defineProps<{
  isShowTitle?: boolean
}>()

const { locale, t } = useI18n()
const userStore = useUserStore()

const options = [{
  label: t('locale.ru'),
  value: 'ru',
}, {
  label: t('locale.en'),
  value: 'en',
}]
</script>

<template>
  <div>
    <template v-if="props.isShowTitle">
      <UiTitleSection
        class="pb-2"
      >
        {{ t('locale.title') }}
      </UiTitleSection>

      <FormSelect
        :options
        :value="locale"
        @change="(locale: LocaleSlug) => userStore.saveUserLocale(locale)"
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
          @click="userStore.saveUserLocale(locale === 'ru' ? 'en' : 'ru')"
        />
      </UTooltip>
    </template>
  </div>
</template>
