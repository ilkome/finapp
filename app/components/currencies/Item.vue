<script setup lang="ts">
import type { CurrencyCode } from '~/components/currencies/types'

const props = defineProps<{
  code: CurrencyCode
  isBase?: boolean
  name: string
  rate?: number
  symbol?: string
}>()

const emit = defineEmits<{
  setBase: [code: CurrencyCode]
}>()

const { t } = useI18n()

const contextMenuItems = computed(() => [[{
  disabled: props.isBase,
  icon: 'lucide:star',
  label: t('currencies.page.setBase'),
  onSelect: () => emit('setBase', props.code),
}]])
</script>

<template>
  <UContextMenu :items="contextMenuItems">
    <UiElement
      :lineWidth="props.isBase ? 6 : 0"
      class="group"
      insideClasses="!min-h-[44px]"
    >
      <div class="flex items-center justify-between gap-3">
        <div class="flex items-center gap-3">
          <div class="w-12 font-medium">
            {{ props.code }}
          </div>

          <div class="text-muted text-sm">
            {{ props.name }}
            <span v-if="props.symbol" class="ml-1 opacity-60">
              {{ props.symbol }}
            </span>
          </div>
        </div>

        <div class="shrink-0 text-right text-sm tabular-nums">
          <template v-if="props.isBase">
            <span class="text-muted text-xs opacity-60">
              {{ t('currencies.base') }}
            </span>
          </template>
          <template v-else-if="props.rate != null">
            {{ props.rate.toFixed(props.rate < 0.01 ? 6 : props.rate < 1 ? 4 : 2) }}
          </template>
        </div>
      </div>
    </UiElement>
  </UContextMenu>
</template>
