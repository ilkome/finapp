<script setup lang="ts">
import { getStyles } from '~/components/ui/getStyles'
import type { IntervalRange } from '~/components/date/useIntervalRange'

const props = defineProps<{
  intervalRange: IntervalRange
}>()

function clear() {
  props.intervalRange.subtracted.value = 0
  props.intervalRange.interval.value.selected = -1
}
</script>

<template>
  <div
    :class="[getStyles('item', ['link', 'rounded', 'minh2'])]"
    class="font-primary flex items-center text-nowrap px-3 py-2 text-base font-medium leading-none"

    @click="clear"
  >
    <UiIconReturn class="size-5" />
  </div>
</template>
