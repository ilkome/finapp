<script setup lang="ts">
import type { Theme } from '~/components/theme/types'

import { useTheme } from '~/components/theme/useTheme'

const props = defineProps<{
  isShowTitle?: boolean
}>()

const { t } = useI18n()
const colorMode = useColorMode()
const { options, preference, setTheme } = useTheme()
</script>

<template>
  <div>
    <template v-if="props.isShowTitle">
      <UiTitle3
        class="pb-2"
      >
        {{ t('theme.title') }}
      </UiTitle3>

      <FormSelect
        :options
        :value="preference"
        @change="(theme: Theme) => setTheme(theme)"
      />
    </template>

    <UButton
      v-else
      :icon="colorMode.value === 'light' ? 'lucide:sun' : 'lucide:moon'"
      color="neutral"
      variant="ghost"
      square
      aria-label="Theme switcher"
      size="lg"
      @click="setTheme(colorMode.value === 'light' ? 'dark' : 'light')"
    />
  </div>
</template>

<i18n lang="yaml" src="./locale.yaml" />
