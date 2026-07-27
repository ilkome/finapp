<script setup lang="ts">
import type { Range } from '~~/utils/date/types'

import { createRangeFormatter } from '~~/utils/date/labels'

import { statDateKey } from '~/components/stat/injectionKeys'

const statDate = inject(statDateKey)!
const { locale, t } = useI18n()

const { formatRange } = createRangeFormatter(t, locale.value)

const range = computed<Range>(() => {
  return statDate.params.value.intervalSelected !== -1
    ? statDate.intervalsInRange.value[statDate.params.value.intervalSelected]
      ? statDate.intervalsInRange.value[statDate.params.value.intervalSelected]!
      : statDate.range.value
    : statDate.range.value
})

const date = computed(() => {
  const isIntervalSelected = statDate.params.value.intervalSelected !== -1
  const intervalsBy = isIntervalSelected ? statDate.params.value.intervalsBy : statDate.params.value.rangeBy
  const rangeDuration = isIntervalSelected ? statDate.params.value.intervalsDuration : statDate.params.value.rangeDuration

  return `${formatRange(range.value, intervalsBy, rangeDuration)}`
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
