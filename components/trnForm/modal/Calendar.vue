<script setup lang="ts">
import Datepicker from 'vuejs-datepicker'
import { useTrnFormStore } from '~/components/trnForm/useTrnForm'

const options = {
  'use-utc': true,
  'disabledDates': {
    from: new Date(),
  },
}

const { $store, $day } = useNuxtApp()
const $trnForm = useTrnFormStore()

function handleSelectDate(date, close) {
  $trnForm.values.date = $day(date).valueOf()
  close()
}

function handleSelectDateDaysAgo(daysAgo, close) {
  $trnForm.values.date = $day().subtract(daysAgo, 'day').valueOf()
  close()
}

function afterClose() {
  $store.commit('trnForm/closeTrnFormModal', 'calendar')
}
</script>

<template lang="pug">
TrnFormModal(@closed="afterClose")
  template(#header)
    template {{ $t('common.date') }}

  template(#default="{ close }")
    Datepicker(
      :disabledDates="options.disabledDates"
      :inline="true"
      :monday-first="true"
      :value="$trnForm.values.date"
      calendar-class="inlineCalendar__in"
      wrapper-class="inlineCalendar"
      @selected="date => handleSelectDate(date, close)"
    )
    .modalLinks
      ModalButton(
        :name="$t('dates.twoDaysAgo')"
        icon="mdi mdi-calendar-clock"
        @onClick="() => handleSelectDateDaysAgo(2, close)"
      )
      ModalButton(
        :name="$t('dates.day.yesterday')"
        icon="mdi mdi-weather-night"
        @onClick="() => handleSelectDateDaysAgo(1, close)"
      )
      ModalButton(
        :name="$t('dates.day.today')"
        icon="mdi mdi-calendar-today"
        @onClick="() => handleSelectDateDaysAgo(0, close)"
      )
</template>

<style lang="stylus">
.inlineCalendar
  padding 0 $m7
  padding-bottom $m7

  .vdp-datepicker__calendar
    width auto
    background none
    border 0

    header
      display flex
      align-items center
      justify-content space-between
      padding-bottom $m7
      line-height 1

      .prev
      .next
        width 48px
        height 48px
        min-width 48px
        margin 0
        background var(--c-item-bg-main)
        border-radius 50%
        anim()

        &.disabled
          opacity 0

      .prev:after
        border-right 10px solid var(--c-bg-9)

      .next:after
        border-left 10px solid var(--c-bg-9)

      .day__month_btn
      .month__year_btn.up
      span
        margin 0 $m7
        padding $m6 0
        border-radius $m3
        font-header-1()

        &:hover
          background none !important

          @media $media-laptop
            background var(--c-bg-6) !important

    .cell
      height 46px

    .cell.day-header
      height auto
      padding-bottom $m5
      color rgb(117, 117, 117)
      line-height 1

    .day
      cursor pointer
      position relative
      padding-top $m2
      text-align center
      border-radius 24px

    .today
      color var(--c-font-1)
      background var(--c-bg-5)

    .disabled
      color var(--c-font-4)

    .cell.selected
      color var(--c-font-1)
      background var(--c-blue-1)

    .cell.month
    .cell.year
      border-radius $m5
</style>
