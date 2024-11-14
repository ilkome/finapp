<script setup lang="ts">
import type { IntervalRange } from '~/components/date/useIntervalRange'
import type { Range } from '~/components/date/types'

defineProps<{
  intervalRange: IntervalRange
  maxRange: Range
}>()

const emit = defineEmits<{
  onClose: []
  set7Days: [close: () => void]
  set7DaysMini: [close: () => void]
  set12Months: [close: () => void]
  set30DaysMini: [close: () => void]
  setAllData: [close: () => void]
  setAllSkipEmpty: [close: () => void]
}>()

const { t } = useI18n()
</script>

<template>
  <BaseBottomSheet2
    isShow
    drugClassesCustom="bg-foreground-1 max-w-xl grid md:mb-12 max-h-[98dvh]"
    @closed="emit('onClose')"
  >
    <template #handler="{ close }">
      <BaseBottomSheetHandler />
      <BaseBottomSheetClose @onClick="close" />
    </template>

    <template #default="{ close }">
      <div class="scrollerBlock grid max-h-[98dvh] overflow-hidden overflow-y-auto p-2 pb-4">
        <UiTitle9 class="pb-3 pt-1">
          {{ t("dates.select") }}
        </UiTitle9>

        <StatDateSelector
          :intervalRange
          :maxRange
          @set12Months="emit('set12Months', close)"
          @set7Days="emit('set7Days', close)"
          @set7DaysMini="emit('set7DaysMini', close)"
          @set30DaysMini="emit('set30DaysMini', close)"
          @setAllData="emit('setAllData', close)"
          @setAllSkipEmpty="emit('setAllSkipEmpty', close)"
          @onClose="close"
        />
      </div>
    </template>
  </BaseBottomSheet2>
</template>
