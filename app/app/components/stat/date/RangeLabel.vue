<script setup lang="ts">
import type { Range } from '~~/utils/date/types'

import { createRangeFormatter } from '~~/utils/date/labels'

import { statDateKey } from '~/components/stat/injectionKeys'

const statDate = inject(statDateKey)!
const { locale, t } = useI18n()

const { formatRangeExact, formatRangeWithLast } = createRangeFormatter(t, locale.value)

const range = computed<Range>(() => {
  return statDate.params.value.intervalSelected !== -1
    ? statDate.intervalsInRange.value[statDate.params.value.intervalSelected]
      ? statDate.intervalsInRange.value[statDate.params.value.intervalSelected]!
      : statDate.range.value
    : statDate.range.value
})

const date = computed(() => {
  if (statDate.params.value.rangePanOffset !== 0) {
    return formatRangeExact({
      by: statDate.params.value.granularityBy,
      duration: statDate.intervalsInRange.value.length,
      end: new Date(range.value.end),
      start: new Date(range.value.start),
    })
  }

  const isIntervalSelected = statDate.params.value.intervalSelected !== -1
  const by = isIntervalSelected ? statDate.params.value.granularityBy : statDate.params.value.rangeBy
  const duration = isIntervalSelected ? statDate.params.value.granularityDuration : statDate.params.value.rangeDuration
  const isShowMaxRange = statDate.params.value.isShowMaxRange && !isIntervalSelected

  return formatRangeWithLast(
    {
      by,
      duration,
      end: new Date(range.value.end),
      start: new Date(range.value.start),
    },
    isShowMaxRange,
  )
})
</script>

<template>
  <div class="flex min-h-10.5 items-center gap-1 leading-none text-nowrap capitalize">
    {{ date }}
    <data
      v-if="statDate.params.value.isShowMaxRange && statDate.params.value.intervalSelected === -1"
      class="inline-flex w-auto items-center rounded-sm bg-elevated px-1 py-px text-2xs leading-none text-muted"
    >max</data>
  </div>
</template>
