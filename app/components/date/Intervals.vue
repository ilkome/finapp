<script setup lang="ts">
import type { Grouped, IntervalRangeProvider } from '~/components/date/types'

const emit = defineEmits<{
  close: []
}>()

const intervalRange = inject('intervalRange') as IntervalRangeProvider

const groups = computed<Grouped[]>(() => [{
  groupedBy: 'day',
  groupedDuration: 1,
}, {
  groupedBy: 'week',
  groupedDuration: 1,
}, {
  groupedBy: 'month',
  groupedDuration: 1,
}, {
  groupedBy: 'month',
  groupedDuration: 1,
}, {
  groupedBy: 'year',
  groupedDuration: 1,
}])

function selectInterval(grouped: Grouped) {
  intervalRange.setGrouped(grouped)
  emit('close')
}
</script>

<template>
  <DateLinkItem
    v-for="group in groups"
    :key="group.groupedBy"
    :isActive="group.groupedBy === intervalRange.params.value.groupedBy && group.groupedDuration === intervalRange.params.value.groupedDuration"
    @click="selectInterval(group)"
  >
    {{ group.groupedDuration }} {{ group.groupedBy }}
  </DateLinkItem>
</template>
