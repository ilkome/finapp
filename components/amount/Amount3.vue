<script setup lang="ts">
import currency from 'currency.js'

const props = defineProps<{
  value: number
}>()

const separator = ' '

const amount = computed(() =>
  currency(props.value, {
    symbol: '',
    precision: 0,
    pattern: '#',
    separator,
  }).format(),
)
</script>

<template lang="pug">
span.whitespace-nowrap {{ amount }}
</template>
