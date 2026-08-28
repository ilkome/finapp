<script setup lang="ts">
import { statConfigKey } from '~/components/stat/injectionKeys'

const statConfig = inject(statConfigKey)!
</script>

<template>
  <div
    class="grid gap-3"
  >
    <UiNumberStepper
      :modelValue="statConfig.config.value.average.count"
      :min="1"
      @update:modelValue="value => statConfig.updateConfig('average', { count: value })"
    />
  </div>
</template>
