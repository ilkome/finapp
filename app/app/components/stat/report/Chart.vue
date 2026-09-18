<script setup lang="ts">
import type { Period } from '~~/utils/date/types'

import type { StatChartCtx } from '~/components/stat/report/types'

import { statDateKey } from '~/components/stat/injectionKeys'
import { useTrnsFormStore } from '~/components/trnForm/useTrnsFormStore'

const props = defineProps<{
  ctx: StatChartCtx
}>()

const emit = defineEmits<{
  select: [intervalKey?: number]
}>()

const statDate = inject(statDateKey)!
const trnsFormStore = useTrnsFormStore()

const window = computed(() => ({
  bufferSize: props.ctx.chartWindow.bufferIntervals.value.length,
  commitCount: props.ctx.chartWindow.commitCount.value,
  endValue: props.ctx.chartWindow.endValue.value,
  isPannable: props.ctx.chartWindow.isEnabled.value,
  startValue: props.ctx.chartWindow.startValue.value,
}))

async function onClickChart(intervalKey: number) {
  emit('select', intervalKey)
  const day = await props.ctx.chartWindow.selectIntervalByKey(intervalKey)
  if (day)
    trnsFormStore.values.date = day
}

function onChangePeriod(period: Period) {
  statDate.setGranularityBy(period)
}
</script>

<template>
  <StatChartView
    v-if="ctx.shouldShowAmounts.value"
    :chartConfig="ctx.params.statConfig.config.value.chart"
    :chartType="ctx.effectiveChartType.value"
    :isShowMaxRange="statDate.params.value.isShowMaxRange"
    :panOffset="statDate.params.value.rangePanOffset"
    :period="statDate.params.value.granularityBy"
    :range="statDate.range.value"
    :series="ctx.chartSeries.value"
    :window
    :xAxisLabels="ctx.chartXAxisLabels.value"
    class="min-w-0"
    @changePeriod="onChangePeriod"
    @click="onClickChart"
    @preview="ctx.chartWindow.onPreview"
    @previewEnd="ctx.chartWindow.commitPreview()"
    @select="emit('select')"
  >
    <template #settings>
      <StatChartSettingsPopover />
    </template>
  </StatChartView>
</template>
