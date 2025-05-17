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

    <template v-else>
      <UTooltip :text="t('theme.title')">
        <UButton
          :aria-label="t('theme.title')"
          :icon="colorMode.value === 'light' ? 'lucide:sun' : 'lucide:moon'"
          class="text-muted"
          color="neutral"
          size="lg"
          square
          variant="ghost"
          @click="setTheme(colorMode.value === 'light' ? 'dark' : 'light')"
        />
      </UTooltip>
    </template>
  </div>
</template>
