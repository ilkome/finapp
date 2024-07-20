<script setup lang="ts">
import dayjs from 'dayjs'
import type { PeriodDuration, Range } from '~/components/date/types'
import { getStyles } from '~/components/ui/getStyles'

const props = defineProps<{
  interval: PeriodDuration
}>()

const emit = defineEmits<{
  setRange: [range: Range]
}>()

function movePeriod() {
  emit('setRange', {
    end: dayjs().endOf(props.interval.period).valueOf(),
    start: dayjs().subtract(props.interval.duration - 1, props.interval.period).startOf(props.interval.period).valueOf(),
  })
}
</script>

<template>
  <div
    :class="[
      getStyles('item', ['link', 'rounded', 'minh2']),
    ]"
    class="flex items-center px-3 py-2 text-base font-medium leading-none font-primary text-nowrap"

    @click="movePeriod()"
  >
    <UiIconReturn class="size-5" />
  </div>
</template>
