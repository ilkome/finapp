<script setup lang="ts">
import type { Range, StatDateProvider } from '~/components/date/types'
import { getStyles } from '~/components/ui/getStyles'

const props = defineProps<{
  maxRange: Range
}>()

const statDate = inject('statDate') as StatDateProvider

const isShowNavNext = computed(() => {
  return !statDate.params.value.isShowMaxRange && (statDate.range.value.start < new Date().getTime() || (statDate.range.value.start !== props.maxRange.start && statDate.range.value.end !== props.maxRange.end))
})
</script>

<template>
  <div class="items-top flex gap-2 pt-2">
    <UiTitle10
      @click="statDate.modals.value.dateSelector = !statDate.modals.value.dateSelector"
    >
      <StatDateRange />
    </UiTitle10>

    <div
      v-if="!statDate.params.value.customDate"
      class="flex gap-1"
    >
      <DateNav
        v-if="isShowNavNext"
        :maxRange
      />
    </div>
  </div>
</template>
