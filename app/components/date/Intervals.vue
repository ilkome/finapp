<script setup lang="ts">
import type { Interval } from '~/components/date/types'

const props = defineProps<{
  grouped: Interval
}>()

const emit = defineEmits<{
  onSelect: [e: Interval]
}>()

const intervalGroups = computed<Interval[]>(() => [{
  duration: 1,
  period: 'day',
}, {
  duration: 1,
  period: 'week',
}, {
  duration: 1,
  period: 'month',
}, {
  duration: 6,
  period: 'month',
}, {
  duration: 1,
  period: 'year',
}])
</script>

<template>
  <DateLinkItem
    v-for="rangeItem in intervalGroups"
    :key="rangeItem.period"
    :isActive="rangeItem.period === props.grouped.period && rangeItem.duration === props.grouped.duration"
    @click="emit('onSelect', rangeItem)"
  >
    {{ rangeItem.duration }} {{ rangeItem.period }}
  </DateLinkItem>
</template>
