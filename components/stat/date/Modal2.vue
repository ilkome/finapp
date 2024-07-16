<script setup lang="ts">
import type { RangeDuration } from '~/components/date/types'
import { getStyles } from '~/components/ui/getStyles'

const props = defineProps<{
  hide?: () => void
}>()

const emit = defineEmits<{
  setRangeByPeriod: [rangeDuration: RangeDuration]
}>()

function onClick(rangeDuration: RangeDuration) {
  if (props.hide)
    props.hide()

  emit('setRangeByPeriod', rangeDuration)
}

type RangeDurationWithIcon = RangeDuration & { icon: string }
const ranges: RangeDurationWithIcon[] = [
  { duration: 0, groupBy: 'period', icon: 'mdi:calendar-today', label: 'Day', period: 'day' },
  { duration: 0, groupBy: 'period', icon: 'mdi:calendar-week', label: 'Week', period: 'week' },
  { duration: 0, groupBy: 'period', icon: 'mdi:calendar-month', label: 'Month', period: 'month' },
  { duration: 0, groupBy: 'period', icon: 'mdi:calendar-star', label: 'Year', period: 'year' },
  { duration: 0, groupBy: 'all', icon: 'mdi:calendar-multiple', label: 'All', period: 'year' },
]
</script>

<template>
  <div class="grid min-w-[180px] gap-1 overflow-hidden bg-item-4 p-2">
    <div
      v-for="rangeItem in ranges"
      :key="rangeItem.period"
      :class="[
        ...getStyles('item', ['link', 'rounded', 'padding1', 'minh2']),
      ]"
      class="flex items-center gap-3"
      @click="onClick(rangeItem)"
    >
      <Icon :name="rangeItem.icon" size="22" />
      <div class="text-sm">
        {{ rangeItem.label }}
      </div>
    </div>

    <UButton
      :label="$t('close')"
      size="lg"
      block
      color="blue"
      variant="solid"
      @click="props.hide"
    />
  </div>
</template>
