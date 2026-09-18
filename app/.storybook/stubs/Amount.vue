<script setup lang="ts">
// The real Amount reads base currency and rates from stores; a story only needs the number.
const { amount, currencyCode } = defineProps<{ amount: number, currencyCode: string }>()
</script>

<template>
  <span class="text-sm font-semibold tabular-nums">{{ amount.toFixed(2) }} {{ currencyCode }}</span>
</template>
