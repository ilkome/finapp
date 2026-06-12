<script setup lang="ts">
import type { CategoryId } from '~/components/categories/types'
import type { Period } from '~/components/date/types'
import type { ChartSeries } from '~/components/stat/types'
import type { ChartPieGroup } from '~/components/stat/useStatItem'

import { statConfigKey, statDateKey } from '~/components/stat/injectionKeys'
import { resolveChartType } from '~/components/stat/useStatConfig'
import { useTrnsFormStore } from '~/components/trnForm/useTrnsFormStore'

const props = defineProps<{
  pieGroups: ChartPieGroup[]
  series: ChartSeries[]
  xAxisLabels: number[]
}>()

const emit = defineEmits<{
  clickCategory: [id: CategoryId]
}>()

const { t } = useI18n()
const statDate = inject(statDateKey)!
const statConfig = inject(statConfigKey)!
const trnsFormStore = useTrnsFormStore()

// Charts mount on the first idle frame so echarts doesn't compete with the LCP render.
const isChartMountReady = useIdleMount()
const isChartShow = computed(() => statConfig.config.value.isChartShow)
const chartView = computed(() => statConfig.config.value.chartView)
const chartType = computed(() => resolveChartType(statConfig.config.value.chartType, statConfig.config.value.chart.mode))
const isPie = computed(() => chartType.value === 'pie')
const isShowQuick = computed(() => statConfig.config.value.date.isShowQuick)

function onClickChart(idx: number) {
  const day = statDate.selectInterval(idx)
  if (day)
    trnsFormStore.values.date = day
}

function onChangePeriod(period: Period) {
  statDate.setIntervalsBy(period)
}
</script>

<template>
  <div
    v-if="isChartShow"
    :class="{
      '@3xl/main:max-w-xl': chartView === 'half' && !isPie,
    }"
  >
    <div
      v-if="!isPie"
      class="-mb-1 flex justify-end"
    >
      <StatDateQuick v-if="isShowQuick" />

      <div class="h-7">
        <StatChartIntervals
          :class="{ 'border-accented border-l': isShowQuick }"
          :period="statDate.params.value.intervalsBy"
          :range="statDate.range.value"
          @changePeriod="onChangePeriod"
        />
      </div>
    </div>

    <div
      v-if="isPie && isChartMountReady"
      class="grid gap-4"
      :class="{ '@sm/stat:grid-cols-2': props.pieGroups.length > 1 }"
    >
      <LazyStatChartPieView
        v-for="group in props.pieGroups"
        :key="group.type"
        :pieData="group.pieData"
        :showLegend="props.pieGroups.length === 1"
        :typeLabel="t(`money.${group.type}`)"
        @clickCategory="emit('clickCategory', $event)"
      />
    </div>

    <LazyStatChartView
      v-else-if="isChartMountReady"
      :chartType
      :period="statDate.params.value.intervalsBy"
      :series="props.series"
      :xAxisLabels="props.xAxisLabels"
      @click="onClickChart"
    />

    <!-- Space-reserving placeholder: same height as the chart, so the idle mount doesn't shift layout. -->
    <div v-else class="h-40 @3xl/stat:h-52" />
  </div>
</template>
