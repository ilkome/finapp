<script setup lang="ts">
import { getStyles } from '~/components/ui/classes'

const setNextPeriodDate = inject('setNextPeriodDate') as () => void
const setPrevPeriodDate = inject('setPrevPeriodDate') as () => void

</script>

<template>
<div class="flex">
  <div
    :class="getStyles('item', ['link', 'rounded'])"
    @click="setNextPeriodDate"
  >
    <UiIconChevron class="size-8" />
  </div>

  <div
    :class="getStyles('item', ['link', 'rounded'])"
    @click="setPrevPeriodDate"
  >
    <UiIconChevron class="size-8 rotate-180" />
  </div>
</div>
</template>
