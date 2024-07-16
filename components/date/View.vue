<script setup lang="ts">
import type { Period } from '~/components/date/types'
import { getStyles } from '~/components/ui/getStyles'

const props = defineProps<{
  date: string
  period: Period
}>()
</script>

<template>
  <VDropdown
    :overflowPadding="12"
    autoBoundaryMaxSize
    placement="bottom-start"
    class="flex"
  >
    <div
      :class="getStyles('item', ['link', 'rounded', 'minh2'])"
      class="flex items-center px-3 py-2 text-base font-medium leading-none font-primary text-nowrap"
    >
      {{ props.date }}
    </div>

    <template #popper="{ hide }">
      <slot name="modal" :hide="hide" />
    </template>
  </VDropdown>
</template>
