<script setup lang="ts">
import { useStatConfigCtx } from '~/components/stat/config/useStatConfigCtx'

const { t } = useI18n()
const statConfig = useStatConfigCtx()
const activeChartType = computed(() => statConfig.chart.value.type)
</script>

<template>
  <template v-if="activeChartType === 'line'">
    <StatConfigSwitch
      path="chart.line.isShowPoints"
      :title="t('stat.config.chart.line.showPoints')"
    />
    <StatConfigSwitch
      path="chart.line.isSmooth"
      :title="t('stat.config.chart.line.smooth')"
    />
    <StatConfigSwitch
      path="chart.line.isGradient"
      :title="t('stat.config.chart.line.gradient')"
    />
    <StatConfigSwitch
      path="chart.line.isSkipZero"
      :title="t('stat.config.chart.line.skipZero')"
    />
  </template>
</template>
