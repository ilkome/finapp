<script setup lang="ts">
import { BarChart } from 'echarts/charts'
import { GridComponent, TooltipComponent } from 'echarts/components'
import { use } from 'echarts/core'
import { SVGRenderer } from 'echarts/renderers'
import VChart from 'vue-echarts'

import { formatAmount } from '~/components/amount/utils'

export type LoanAmortizationRow = {
  interest: number
  isPaid: boolean
  /** Preformatted month of the payment. */
  label: string
  principal: number
}

const props = defineProps<{
  currencyCode: string
  rows: LoanAmortizationRow[]
}>()

use([BarChart, GridComponent, SVGRenderer, TooltipComponent])

const { t } = useI18n()

// Paid months at full strength, the plan faded: the split shifts from interest to principal over the term.
function bar(value: number, isPaid: boolean) {
  return { itemStyle: { opacity: isPaid ? 1 : 0.35 }, value }
}

const option = computed(() => ({
  grid: { bottom: 20, containLabel: true, left: 0, right: 0, top: 8 },
  series: [
    { color: 'var(--ui-primary)', data: props.rows.map(row => bar(row.principal, row.isPaid)), name: t('loans.principal'), stack: 'p', type: 'bar' },
    { color: 'var(--color-expense-1)', data: props.rows.map(row => bar(row.interest, row.isPaid)), name: t('loans.interest'), stack: 'p', type: 'bar' },
  ],
  tooltip: { trigger: 'axis', valueFormatter: (value: number) => formatAmount(value, props.currencyCode) },
  xAxis: { axisLabel: { color: 'var(--ui-text-muted)' }, axisTick: { show: false }, data: props.rows.map(row => row.label), type: 'category' },
  yAxis: { axisLabel: { show: false }, splitLine: { show: false }, type: 'value' },
}))
</script>

<template>
  <div v-if="props.rows.length > 1" class="grid gap-2" data-loan-amortization>
    <UiTitleSection>
      {{ t('loans.amortization') }}
    </UiTitleSection>
    <div class="h-40">
      <VChart :option :updateOptions="{ notMerge: true }" autoresize />
    </div>
  </div>
</template>
