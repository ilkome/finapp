<script setup lang="ts">
import { sub } from 'date-fns'
import type { Range, StatDateProvider } from '~/components/date/types'
import { getEndOf, getStartOf } from '~/components/date/utils'
import { getStyles } from '~/components/ui/getStyles'

const props = defineProps<{
  maxRange: Range
}>()

const statDate = inject('statDate') as StatDateProvider

const isShowNavHome = computed(() => {
  const start = getStartOf(sub(new Date(), { [`${statDate.params.value.rangeBy}s`]: statDate.params.value.rangeDuration - 1 }), statDate.params.value.rangeBy).getTime()
  const end = getEndOf(new Date(), statDate.params.value.rangeBy).getTime()

  return !statDate.params.value.isShowMaxRange && (statDate.params.value.intervalSelected !== -1 || (statDate.range.value.start !== start && statDate.range.value.end !== end))
})

const isShowNavNext = computed(() => {
  return !statDate.params.value.isShowMaxRange && (statDate.range.value.start < new Date().getTime() || (statDate.range.value.start !== props.maxRange.start && statDate.range.value.end !== props.maxRange.end))
})
</script>

<template>
  <div class="flex gap-2">
    <div
      v-if="!statDate.params.value.customDate"
      class="flex gap-1"
    >
      <DateNav
        v-if="isShowNavNext"
        :maxRange
      />
      <DateNavHome v-if="isShowNavHome" />
    </div>

    <div
      :class="getStyles('item', ['alt', 'padding3', 'link', 'rounded', 'minh2', 'center2', 'minw1'])"
      class="!text-1 !px-4"
      @click="statDate.modals.value.dateSelector = !statDate.modals.value.dateSelector"
    >
      <StatDateRange />
    </div>
  </div>
</template>
