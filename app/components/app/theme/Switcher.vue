<script setup lang="ts">
import type { Theme } from '~/components/app/theme/types'

import { useTheme } from '~/components/app/theme/useTheme'

const props = defineProps<{
  isShowTitle?: boolean
}>()

const { t } = useI18n()
const { options, preference, setTheme } = useTheme()
</script>

<template>
  <div>
    <UiTitle3
      v-if="props.isShowTitle"
      class="pb-2"
    >
      {{ t('theme.title') }}
    </UiTitle3>

    <FormSelect
      :options
      :value="preference"
      @change="(theme: Theme) => setTheme(theme)"
    />
  </div>
</template>

<i18n lang="yaml" src="./locale.yaml" />
