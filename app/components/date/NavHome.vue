<script setup lang="ts">
import { getStyles } from '~/components/ui/getStyles'
import type { StatDateProvider } from '~/components/date/types'

const statDate = inject('statDate') as StatDateProvider

function clear() {
  statDate.params.value.rangeOffset = 0
  statDate.params.value.intervalSelected = -1
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
