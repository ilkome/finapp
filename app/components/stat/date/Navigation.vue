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
  <div class="items-top flex gap-2">
    <UiTitle8
      isShown
      @click="statDate.modals.value.dateSelector = !statDate.modals.value.dateSelector"
    >
      <StatDateRange />
    </UiTitle8>
    <!-- <div
      :class="getStyles('item', ['padding1', 'link', 'rounded', 'minh2', 'center', 'minw1'])"
      class="!text-1 font-tertiary text-md -mb-2 grow !px-4 font-bold"
    >
      <StatDateRange />
    </div> -->

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
