<script setup lang="ts">
import { statConfigKey } from '~/components/stat/injectionKeys'

const statConfig = inject(statConfigKey)!
</script>

<template>
  <div class="grid gap-3">
    <StatConfigFieldRow parameterId="average.count" :title="$t('stat.config.statAverage.count.label')">
      <UiNumberStepper
        :modelValue="statConfig.config.value.average.count"
        :min="1"
        @update:modelValue="value => statConfig.updateConfig('average', { count: value })"
      />
    </StatConfigFieldRow>
  </div>
</template>
