<script setup lang="ts">
import { pieShapeOptions } from '~/components/stat/config/schema'
import { useStatConfigCtx } from '~/components/stat/config/useStatConfigCtx'

const { t } = useI18n()
const statConfig = useStatConfigCtx()
const activeChartType = computed(() => statConfig.chart.value.type)

const pieShapeItems = computed(() => pieShapeOptions.map(value => ({
  icon: 'i-lucide-circle',
  label: t(`stat.view.pieShape.${value}.label`),
  value,
})))
</script>

<template>
  <template v-if="activeChartType === 'pie'">
    <StatConfigFieldRow parameterId="chart.pie.shape" :title="t('stat.view.pieShape.title')">
      <UTabs
        class="w-40 shrink-0"
        :content="false"
        :items="pieShapeItems"
        :modelValue="statConfig.chart.value.pie.shape"
        size="md"
        :ui="{
          label: 'sr-only',
          list: 'w-full',
          trigger: 'min-w-0',
        }"
        @update:modelValue="(v) => statConfig.updateConfig('chart', { pie: { shape: v as typeof pieShapeOptions[number] } })"
      >
        <template #leading="{ item }">
          <UTooltip :text="item.label">
            <span
              v-if="item.value === 'circle'"
              aria-hidden="true"
              class="size-5 shrink-0 rounded-full bg-current"
            />
            <Icon v-else :name="item.icon" class="size-5 shrink-0" />
          </UTooltip>
        </template>
      </UTabs>
    </StatConfigFieldRow>
    <StatConfigSwitch
      path="chart.pie.isShowLabels"
      :title="t('stat.config.chart.pie.showLabels')"
    />
    <StatConfigSwitch
      path="chart.pie.isShowPercent"
      :title="t('stat.config.chart.pie.showPercent')"
    />
  </template>
</template>
