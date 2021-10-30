<script>
import { ref, computed, useContext } from '@nuxtjs/composition-api'
import Datepicker from 'vuejs-datepicker'

const calendarOptions = {
  'use-utc': true,
  disabledDates: {
    from: new Date()
  }
}

export default {
  components: {
    Datepicker
  },

  setup () {
    const { store } = useContext()

    const date = computed(() => store.state.trnForm.values.date)
    const closeModal = ref(null)

    return {
      date,
      closeModal
    }
  },

  created () {
    this.calendarOptions = calendarOptions
  },

  methods: {
    handleSelectDate (date, close) {
      this.$store.commit('trnForm/setTrnFormValues', {
        date: this.$day(date).valueOf()
      })
      close()
    },

    handleSelectDateDaysAgo (daysAgo, close) {
      this.$store.commit('trnForm/setTrnFormValues', {
        date: this.$day().subtract(daysAgo, 'day').valueOf()
      })
      close()
    },

    afterClose () {
      this.$store.commit('trnForm/closeTrnFormModal', 'calendar')
    }
  }
}
</script>

<template lang="pug">
TrnFormModal(@closed="afterClose")
  template(#header)
    template {{ $t('common.date') }}

  template(#default="{ close }")
    Datepicker(
      :inline="true"
      :value="date"
      :monday-first="true"
      wrapper-class="inlineCalendar"
      calendar-class="inlineCalendar__in"
      :disabledDates="calendarOptions.disabledDates"
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
        icon="mdi mdi-weather-sunset-up"
        @onClick="() => handleSelectDateDaysAgo(0, close)"
      )
</template>

<style lang="stylus">
@import '~assets/stylus/variables'

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
