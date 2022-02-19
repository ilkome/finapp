<script lang="ts">
import Datepicker from 'vuejs-datepicker'
import dayjs from 'dayjs'
import useCalculator from '~/components/trnForm/calculator/useCalculator'
import useFilter from '~/modules/filter/useFilter'

type PeriodNavDirection = 'prev' | 'next'

const sortByDate = (trns, ids) => {
  return ids
    .sort((a, b) => {
      if (trns[a].date > trns[b].date) return -1
      if (trns[a].date < trns[b].date) return 1
      return 0
    })
}

const filterByDate = (trns, ids, date) => {
  console.log(date)
  return ids.filter(
    trnId =>
      (trns[trnId].date >= date.start)
      && (trns[trnId].date <= date.end))
}

export default defineComponent({
  components: { Datepicker },

  setup() {
    const { $store } = useNuxtApp()
    const { setExpression } = useCalculator()
    const { setCategoryFilter } = useFilter()

    const period = reactive({
      name: 'month',
      value: 1,
    })

    // const today = dayjs().subtract(1, 'week').valueOf()
    const today = dayjs().valueOf()

    const date = {
      // @ts-expect-error
      end: dayjs(today).subtract(period.value, period.name).startOf(period.name).valueOf(),
      // @ts-expect-error
      start: dayjs(today).endOf(period.name).valueOf(),
    }

    // @ts-expect-error
    const startDay = computed(() => dayjs().subtract(period.value, period.name).valueOf())
    const endDay = computed(() => dayjs().valueOf())

    const dateRange = reactive({
      start: dayjs(startDay.value).startOf('day').valueOf(),
      end: dayjs(endDay.value).endOf('day').valueOf(),
      // @ts-expect-error
      count: computed(() => dayjs(dateRange.end).diff(dateRange.start, period.name) + 1),
    })

    function onSelectDay(date, type) {
      dateRange[type] = type === 'end' ? dayjs(date).endOf('day').valueOf() : dayjs(date).startOf('day').valueOf()
    }

    function onChangePeriodName(name) {
      period.name = name
      selectPeriod()
    }

    function selectPeriod(direction?: PeriodNavDirection) {
      let selectedDate = dayjs(dateRange.end)
      if (direction === 'next')
        selectedDate = dayjs(selectedDate).add(1, period.name)
      if (direction === 'prev')
        selectedDate = dayjs(selectedDate).subtract(1, period.name)

      // @ts-expect-error
      dateRange.start = dayjs(selectedDate).startOf(period.name).valueOf()
      // @ts-expect-error
      dateRange.end = dayjs(selectedDate).endOf(period.name).valueOf()
    }

    const trns = computed(() => $store.state.trns.items)
    const trnsIds = computed(() => Object.keys(trns.value))

    const selectedTrnsIds = computed(() => {
      if (!$store.getters['trns/hasTrns']) return []
      let ids = []
      ids = filterByDate(trns.value, trnsIds.value, dateRange)
      ids = sortByDate(trns.value, ids)
      return ids
    })

    const actions = trnItem => ({
      onOpenDetails: () => {
        if (!$store.state.trns.modal.show) {
          $store.commit('categories/hideCategoryModal')
          $store.commit('trns/showTrnModal')
          $store.commit('trns/setTrnModalId', trnItem.id)
        }
      },

      onOpenEdit: (event) => {
        event.stopPropagation()
        setExpression(trnItem.amount)
        $store.dispatch('trnForm/openTrnForm', { action: 'edit', trnId: trnItem.id })
        $store.commit('stat/setCategoryModal', { id: null, type: null })
      },

      onSetFilter: (event) => {
        event.stopPropagation()
        setCategoryFilter(trnItem.category.id)
        $store.commit('filter/setFilterDateNow')
        $store.commit('trns/hideTrnModal')
        $store.commit('trns/setTrnModalId', null)
        $store.commit('stat/setCategoryModal', { id: null, type: null })
        $store.dispatch('ui/setActiveTabStat', 'details')
      },
    })

    const disabledDates = {
      from: new Date(),
    }

    return {
      actions,
      selectedTrnsIds,

      startDay,
      dateRange,
      onSelectDay,
      disabledDates,
      selectPeriod,
      onChangePeriodName,

      period,
    }
  },
})
</script>

<template lang="pug">
div
  pre {{ startDay }}
  pre {{ period }}
  pre {{ dateRange }}
  pre {{ $day(dateRange.start).format() }}
  pre {{ $day(dateRange.end).format() }}

  .p-2.text-lg(@click="selectPeriod('prev')") prev
  .p-2.text-lg(@click="selectPeriod('next')") next

  .p-3.flex
    .p-1(@click="onChangePeriodName('day')") day
    .p-1(@click="onChangePeriodName('week')") week
    .p-1(@click="onChangePeriodName('month')") month
    .p-1(@click="onChangePeriodName('year')") year

  .p-3.gap-4.flex
    .py-3.bg-neutral-800
      .px-3.pb-3.text-md.text-center Start Date
      Datepicker(
        :disabledDates="disabledDates"
        :monday-first="true"
        :value="dateRange.start"
        calendar-class="inlineCalendar__in"
        inline
        wrapper-class="inlineCalendar"
        @selected="date => onSelectDay(date, 'start')"
      )

    .py-3.bg-neutral-800
      .px-3.pb-3.text-md.text-center End date
      Datepicker(
        :disabledDates="disabledDates"
        :monday-first="true"
        :value="dateRange.end"
        calendar-class="inlineCalendar__in"
        inline
        wrapper-class="inlineCalendar"
        @selected="date => onSelectDay(date, 'end')"
      )

  .grid.gap-2(
    class="md:grid-cols-2 md:gap-0"
  )
    .p-3
      TrnsItemHistory.py-3.px-2.rounded-md.cursor-pointer(
        v-for="trnId in selectedTrnsIds"
        :key="trnId"
        :actions="actions"
        :trnId="trnId"
      )
</template>

<style lang="stylus" scoped>
//
</style>
