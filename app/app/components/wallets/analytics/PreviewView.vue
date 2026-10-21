<script setup lang="ts">
import type { CurrencyCode } from '~/components/currencies/types'
import type { ForecastRunway } from '~/components/wallets/analytics/ForecastSummaryView.vue'

import { sparklinePoints } from '~/components/wallets/analytics/chartSeries'

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
  return sparklinePoints(values, 100, 30, 2)
    .map(([x, y], index) => `${index ? 'L' : 'M'}${x.toFixed(2)},${y.toFixed(2)}`)
    .join(' ')
})
</script>

<template>
  <WalletsPageLinkCard
    class="h-full grid-rows-[auto_1fr_auto]"
    :title="t('wallets.analytics.title')"
    data-analytics-preview
    @click="emit('click')"
  >
    <svg
      v-if="path"
      viewBox="0 0 100 30"
      preserveAspectRatio="none"
      class="h-14 w-full self-center overflow-visible"
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
  </WalletsPageLinkCard>
</template>
