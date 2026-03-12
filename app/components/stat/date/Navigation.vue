<script setup lang="ts">
import { sub } from 'date-fns'

import { getEndOf, getStartOf } from '~/components/date/utils'
import { statDateKey } from '~/components/stat/injectionKeys'

const { t } = useI18n()
const statDate = inject(statDateKey)!

const isShowNav = computed(() =>
  !statDate.params.value.isShowMaxRange
  && (statDate.range.value.start < Date.now()
    || (
      statDate.range.value.start !== statDate.maxRange.value.start
      && statDate.range.value.end !== statDate.maxRange.value.end)))

const isDayToday = computed(() => statDate.params.value.rangeBy === 'day' && statDate.params.value.rangeDuration === 1 && statDate.range.value.end < getEndOf(new Date(), 'day').getTime())

const isEnd = computed(() =>
  statDate.range.value.end >= getEndOf(new Date(), statDate.params.value.rangeBy).getTime() && !isDayToday.value,
)

const isStart = computed(() =>
  statDate.range.value.start <= statDate.maxRange.value.start,
)

const isShowNavHome = computed(() => {
  const start = getStartOf(sub(new Date(), { [`${statDate.params.value.rangeBy}s`]: statDate.params.value.rangeDuration - 1 }), statDate.params.value.rangeBy).getTime()
  const end = getEndOf(new Date(), statDate.params.value.rangeBy).getTime()

  return !statDate.params.value.isShowMaxRange && (statDate.params.value.intervalSelected !== -1 || (statDate.range.value.start !== start && statDate.range.value.end !== end))
})

function changeDate(way: 'next' | 'prev' | 'today') {
  if (way === 'next' && !isEnd.value) {
    statDate.params.value.rangeOffset = statDate.params.value.rangeOffset - 1
    return
  }

  if (way === 'prev' && !isStart.value) {
    statDate.params.value.rangeOffset = statDate.params.value.rangeOffset + 1
    return
  }

  if (way === 'today') {
    statDate.params.value.rangeOffset = 0
    statDate.params.value.intervalSelected = -1
  }
}
</script>

<template>
  <div class="items-top bg-default/90 sticky top-0 z-20 -my-2 flex grow items-center gap-2 overflow-x-auto py-2 backdrop-blur lg:top-[87px]">
    <div
      v-if="!statDate.params.value.customDate"
      class="flex gap-1"
    >
      <DateNav
        v-if="isShowNav"
        :isEnd
        :isShowNavHome
        :isStart
        position="right"
        @changeDate="changeDate"
      />
    </div>

    <BottomSheetOrDropdown
      :title="t('dates.select')"
      :isOpen="statDate.modal.value.dateSelector"
      class="flex grow-0 gap-1"
      isShowCloseBtn
      @openModal="statDate.modal.value.dateSelector = true"
      @closeModal="statDate.modal.value.dateSelector = false"
    >
      <template #trigger>
        <UiTitleCollapse
          class="_bg-item-4 text-md !grow-0"
          isShown
        >
          <StatDateRange />
        </UiTitleCollapse>
      </template>

      <template #content="{ close }">
        <StatDateSelector
          class="min-w-[362px] pb-2 md:px-3"
          @close="close"
        />
      </template>
    </BottomSheetOrDropdown>

    <slot />
  </div>
</template>
