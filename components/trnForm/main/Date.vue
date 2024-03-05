<script setup lang="ts">
import dayjs from 'dayjs'
import { useTrnFormStore } from '~/components/trnForm/useTrnForm'
import { formatDate } from '~/utils/formatDate'

const $trnForm = useTrnFormStore()

const formattedDate = computed(() => {
  const date = formatDate($trnForm.values.date, 'full')
  return `${date.weekday} <br/> ${date.day} ${date.month}`
})

const isToday = computed(() => {
  return dayjs().isSame($trnForm.values.date, 'day')
})

function changeDate(way: 'prev' | 'next') {
  if (way === 'prev')
    $trnForm.values.date = dayjs($trnForm.values.date).subtract(1, 'day').valueOf()
  if (way === 'next' && !isToday.value)
    $trnForm.values.date = dayjs($trnForm.values.date).add(1, 'day').valueOf()
}
</script>

<template lang="pug">
.trnFormDate.flex.pb-2.px-2.gap-2
  .overflow-hidden.flex.rounded-xl
    .shame1.flex-center.w-12._arrow.bg-item-4.hocus_bg-item-5(
      @click="changeDate('prev')"
    ): .mdi.mdi-chevron-left

    .shame1.flex-center.w-12._arrow.bg-item-4.hocus_bg-item-5(
      :class="{ 'opacity-30 !cursor-default' : isToday }"
      @click="changeDate('next')"
    )
      .mdi.mdi-calendar-today(v-if="isToday")
      .mdi.mdi-chevron-right(v-else)

  .grow.cursor-pointer.py-2.px-3.flex.items-center.rounded-md.text-xs.leading-none.hocus_bg-item-5(
    v-html="formattedDate"
    @click="$trnForm.openTrnFormModal('calendar')"
  )
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
