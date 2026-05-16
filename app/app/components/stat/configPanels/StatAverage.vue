<script setup lang="ts">
import { statConfigKey } from '~/components/stat/injectionKeys'

const statConfig = inject(statConfigKey)!
</script>

<template>
  <div
    class="grid gap-3 transition-opacity"
    :class="{ 'pointer-events-none opacity-50': !statConfig.config.value.statAverage.isShow }"
  >
    <UiNumberStepper
      :modelValue="statConfig.config.value.statAverage.count"
      :min="1"
      @update:modelValue="value => statConfig.updateConfig('statAverage', { count: value })"
    />
  </div>
</template>
