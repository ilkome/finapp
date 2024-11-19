<script setup lang="ts">
import type { Grouped, StatDateProvider } from '~/components/date/types'

const emit = defineEmits<{
  close: []
}>()

const statDate = inject('statDate') as StatDateProvider

const intervals = computed<Grouped[]>(() => [{
  intervalsBy: 'day',
  intervalsDuration: 1,
}, {
  intervalsBy: 'week',
  intervalsDuration: 1,
}, {
  intervalsBy: 'month',
  intervalsDuration: 1,
}, {
  intervalsBy: 'year',
  intervalsDuration: 1,
}])

function selectInterval(grouped: Grouped) {
  statDate.setInterval(grouped)
  emit('close')
}
</script>

<template>
  <DateLinkItem
    v-for="item in intervals"
    :key="item.intervalsBy"
    :isActive="item.intervalsBy === statDate.params.value.intervalsBy && item.intervalsDuration === statDate.params.value.intervalsDuration"
    @click="selectInterval(item)"
  >
    {{ item.intervalsDuration }} {{ item.intervalsBy }}
  </DateLinkItem>
</template>
