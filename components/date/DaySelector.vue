<script setup lang="ts">
import type { GroupBy, Range } from '~/components/date/types'
import { getStyles } from '~/components/ui/getStyles'

defineProps<{
  groupBy: GroupBy
  range: Range
}>()

const emit = defineEmits<{
  setRangeByCalendar: [range: Range]
}>()
</script>

<template>
  <UPopover
    :popper="{ placement: 'bottom-start' }"
  >
    <div
      :class="[
        getStyles('item', ['link', 'minh2']),
      ]"
      class="flex items-center px-3 py-0 text-xs bg-item-4 rounded-full leading-none font-primary text-nowrap"
    >
      {{ $t('dates.select') }}
    </div>

    <template #panel="{ close }">
      <DatePicker
        :value="range"
        color="blue"
        @close="close"
        @update:modelValue="(range: Range) => emit('setRangeByCalendar', range)"
      />
    </template>
  </UPopover>
</template>
