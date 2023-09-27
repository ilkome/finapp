<script setup lang="ts">
import { useTrnFormStore } from '~/components/trnForm/useTrnForm'
import { formatDate } from '~/utils/formatDate'

const { $day } = useNuxtApp()
const $trnForm = useTrnFormStore()

const formattedDate = computed(() => {
  const date = formatDate($trnForm.values.date, 'full')
  return `${date.weekday} <br/> ${date.day} ${date.month}`
})

const isToday = computed(() => {
  return $day().isSame($trnForm.values.date, 'day')
})

function changeDate(way: 'prev' | 'next') {
  if (way === 'prev')
    $trnForm.values.date = $day($trnForm.values.date).subtract(1, 'day').valueOf()
  if (way === 'next' && !isToday.value)
    $trnForm.values.date = $day($trnForm.values.date).add(1, 'day').valueOf()
}
</script>

<template lang="pug">
.trnFormDate.flex.pb-2.px-2.gap-2
  .overflow-hidden.flex.rounded-xl
    .shame1.flex-center.w-12._arrow.bg-skin-item-main-bg.hocus_bg-skin-item-main-hover(
      @click="changeDate('prev')"
    ): .mdi.mdi-chevron-left

    .shame1.flex-center.w-12._arrow.bg-skin-item-main-bg.hocus_bg-skin-item-main-hover(
      :class="{ 'opacity-30 !cursor-default' : isToday }"
      @click="changeDate('next')"
    )
      .mdi.mdi-calendar-today(v-if="isToday")
      .mdi.mdi-chevron-right(v-else)

  .grow.cursor-pointer.py-2.px-3.flex.items-center.rounded-md.text-xs.leading-none.hocus_bg-skin-item-main-hover(
    v-html="formattedDate"
    @click="$store.commit('trnForm/showTrnFormModal', 'calendar')"
  )
</template>

<style lang="stylus" scoped>
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
    padding $m7
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
      background var(--c-item-bg-main)
      .mdi
        font-size 24px
</style>
