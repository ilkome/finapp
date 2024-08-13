<script setup lang="ts">
import { getStyles } from '~/components/ui/getStyles'
import type { IntervalRange } from "~/components/date/useIntervalRange";


defineProps<{
  intervalRange: IntervalRange
}>()
</script>

<template>
  <div
    :class="[getStyles('item', ['link', 'rounded', 'minh2'])]"
    class="flex items-center px-3 py-2 text-base font-medium leading-none font-primary text-nowrap"

    @click="intervalRange.subtracted.value = 0"
  >
    <UiIconReturn class="size-5" />
  </div>
</template>
