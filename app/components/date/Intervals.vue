<script setup lang="ts">
import type { Grouped, StatDateProvider } from '~/components/date/types'

const emit = defineEmits<{
  close: []
}>()

const statDate = inject('statDate') as StatDateProvider

const groups = computed<Grouped[]>(() => [{
  intervalsBy: 'day',
  intervalsDuration: 1,
}, {
  intervalsBy: 'week',
  intervalsDuration: 1,
}, {
  intervalsBy: 'month',
  intervalsDuration: 1,
}, {
  intervalsBy: 'month',
  intervalsDuration: 1,
}, {
  intervalsBy: 'year',
  intervalsDuration: 1,
}])

function selectInterval(grouped: Grouped) {
  statDate.setGrouped(grouped)
  emit('close')
}
</script>

<template>
  <DateLinkItem
    v-for="group in groups"
    :key="group.intervalsBy"
    :isActive="group.intervalsBy === statDate.params.value.intervalsBy && group.intervalsDuration === statDate.params.value.intervalsDuration"
    @click="selectInterval(group)"
  >
    {{ group.intervalsDuration }} {{ group.intervalsBy }}
  </DateLinkItem>
</template>
