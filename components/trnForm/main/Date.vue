<script setup lang="ts">
import dayjs from 'dayjs'
import { useTrnFormStore } from '~/components/trnForm/useTrnForm'
import { formatDate } from '~/utils/formatDate'
import { getStyles } from '~/components/ui/classes'
import { useFilterStore } from '~/components/filter/useFilterStore'
import type { PeriodProvider } from '~/components/dashboard/Page.vue'

const $trnForm = useTrnFormStore()
const filterStore = useFilterStore()

const period = inject('filter') as PeriodProvider

const formattedDate = computed(() => {
  const date = formatDate($trnForm.values.date, 'full')
  return `${date.weekday} <br/> ${date.day} ${date.month}`
})

const isToday = computed(() => {
  return dayjs().isSame($trnForm.values.date, 'day')
})

function changeDate(way: 'prev' | 'next' | 'today') {
  let newDate: number = dayjs().valueOf()

  if (way === 'prev')
    newDate = dayjs($trnForm.values.date).subtract(1, 'day').valueOf()

  if (way === 'next' && !isToday.value)
    newDate = dayjs($trnForm.values.date).add(1, 'day').valueOf()

  if (way === 'today')
    newDate = dayjs().valueOf()

  $trnForm.values.date = newDate

  if (period.nameWithoutAll.value === 'day')
    period.setDate(dayjs(newDate).startOf(period.nameWithoutAll.value).valueOf())
}
</script>

<template>
  <div class="trnFormDate flex items-center gap-2 px-2 pb-2">
    <div class="flex items-center">
      <div
        :class="[...getStyles('item', ['link', 'rounded']), { '!cursor-default opacity-30': isToday }]"
        class="px-1 text-2xl"
        @click="changeDate('next')"
      >
        <i class="mdi mdi-chevron-left" />
      </div>
      <div
        :class="[
          ...getStyles('item', ['link', 'rounded']),
        ]"
        class="px-1 text-2xl"
        @click="changeDate('prev')"
      >
        <i class="mdi mdi-chevron-right" />
      </div>
      <div
        v-if="!isToday"
        :class="getStyles('item', ['link', 'rounded'])"
        class="px-2 py-3"
        @click="changeDate('today')"
      >
        <UiIconReturn class="size-4" />
      </div>
    </div>

    <VDropdown class="grow">
      <div
        class="flex items-center rounded-md px-3 py-2 text-xs leading-none hocus_bg-item-5"
        v-html="formattedDate"
      />

      <template #popper="{ hide }">
        <TrnFormMainCalendar :hide="hide" />
      </template>
    </VDropdown>
  </div>
</template>

<style lang="stylus" scoped>
@import "../assets/stylus/variables"

.shame1
  color var(--c-font-3)
  font-size 28px
  border 1px solid transparent
  user-select none

.trnFormDate
  &__item
    cursor pointer
    position relative
    display flex
    align-items center
    justify-content center
    width 44px
    height 44px
    padding 16px
    border 1px solid transparent
    user-select none

    +media(400px)
      width 58px
      height 58px

    &._date
      display flex
      padding 0
      width 100%
      height auto
      flex-grow 1
      color var(--c-font-4)
      font-size 12px
      font-weight 400
      line-height 16px
      border-radius 50px
      border-color transparent

    &._arrow
      color var(--c-font-4)
      font-size 28px
      background var(--foreground-1)
      .mdi
        font-size 24px
</style>
