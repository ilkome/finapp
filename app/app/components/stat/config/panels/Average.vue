<script setup lang="ts">
import { useStatConfigCtx } from '~/components/stat/config/useStatConfigCtx'

const statConfig = useStatConfigCtx()
</script>

<template>
  <div class="grid gap-3">
    <StatConfigFieldRow parameterId="average.count" :title="$t('stat.config.statAverage.count.label')">
      <UiNumberStepper
        :modelValue="statConfig.average.value.count"
        :min="1"
        @update:modelValue="value => statConfig.updateConfig('average', { count: value })"
      />
    </StatConfigFieldRow>
  </div>
</template>
