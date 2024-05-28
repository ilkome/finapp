<script setup lang="ts">
import dayjs from 'dayjs'
import { useTrnFormStore } from '~/components/trnForm/useTrnForm'
import { getStyles } from '~/components/ui/getStyles'
import { formatDate } from '~/utils/formatDate'

const $trnForm = useTrnFormStore()

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
}
</script>

<template>
  <div class="trnFormDate flex items-center gap-2">
    <div class="flex items-center">
      <div
        :class="[...getStyles('item', ['link', 'rounded'])]"
        class="px-1 text-2xl"
        @click="changeDate('prev')"
      >
        <Icon name="mdi:chevron-left" size="24" />
      </div>
      <div
        :class="[...getStyles('item', ['link', 'rounded']), { 'opacity-30': isToday }]"
        class="px-1 text-2xl"
        @click="changeDate('next')"
      >
        <Icon name="mdi:chevron-right" size="24" />
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

    <VDropdown
      :overflowPadding="12"
      autoBoundaryMaxSize
      class="grow"
      placement="bottom-start"
    >
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
