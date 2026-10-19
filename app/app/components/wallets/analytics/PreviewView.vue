<script setup lang="ts">
import type { CurrencyCode } from '~/components/currencies/types'
import type { ForecastRunway } from '~/components/wallets/analytics/ForecastSummaryView.vue'

const props = defineProps<{
  /** Balance change over the preview window. */
  change: number
  changeLabel: string
  currencyCode: CurrencyCode
  /** Points of the balance line, oldest first; drawn as a sparkline. */
  points: number[]
  runway: ForecastRunway
}>()

const emit = defineEmits<{
  click: []
}>()

const { t } = useI18n()

const path = computed(() => {
  const values = props.points
  if (values.length < 2)
    return ''
  const min = Math.min(...values)
  const span = Math.max(...values) - min || 1
  return values
    .map((value, index) => `${index ? 'L' : 'M'}${(index / (values.length - 1) * 100).toFixed(2)},${(28 - (value - min) / span * 26).toFixed(2)}`)
    .join(' ')
})
</script>

<template>
  <button
    type="button"
    class="grid gap-2 rounded-sm interactive bg-elevated/30 px-3 py-2 text-left"
    data-analytics-preview
    @click="emit('click')"
  >
    <div class="flex items-center gap-2">
      <UiText variant="caption" class="grow">
        {{ t('wallets.analytics.title') }}
      </UiText>
      <Icon name="lucide:chevron-right" size="16" class="text-muted" />
    </div>

    <svg
      v-if="path"
      viewBox="0 0 100 30"
      preserveAspectRatio="none"
      class="h-8 w-full overflow-visible"
      aria-hidden="true"
    >
      <path
        :d="path"
        fill="none"
        stroke="currentColor"
        stroke-width="1.5"
        vector-effect="non-scaling-stroke"
        :class="props.change < 0 ? 'text-expense-1' : 'text-income-1'"
      />
    </svg>

    <div class="flex flex-wrap items-baseline justify-between gap-x-3 gap-y-1">
      <div class="flex items-center gap-1">
        <UiText variant="meta">
          {{ props.changeLabel }}
        </UiText>
        <Amount
          :amount="props.change"
          :currencyCode="props.currencyCode"
          :isShowBaseRate="false"
          isShowPlus
          variant="compact"
        />
      </div>

      <UiText variant="meta" data-preview-runway>
        <template v-if="props.runway.dateLabel">
          {{ t('wallets.analytics.forecast.enoughFor') }} {{ props.runway.durationLabel ?? t('wallets.analytics.forecast.runOut') }}
        </template>
        <template v-else>
          {{ t('wallets.analytics.forecast.enough') }}
        </template>
      </UiText>
    </div>
  </button>
</template>
