<script>
import { computed, useContext, defineComponent } from '@nuxtjs/composition-api'
import dayjs from 'dayjs'

const sortByDate = (trns, ids) => {
  return ids
    .sort((a, b) => {
      if (trns[a].date > trns[b].date) return -1
      if (trns[a].date < trns[b].date) return 1
      return 0
    })
}

const filterByDate = (trns, ids, date) => {
  return ids.filter(
    trnId =>
      (trns[trnId].date >= date.after) &&
      (trns[trnId].date <= date.before))
}

export default defineComponent({
  name: '',

  setup () {
    const { store } = useContext()

    const period = {
      name: 'week',
      value: 1
    }
    // const today = dayjs().subtract(1, 'week').valueOf()
    const today = dayjs().valueOf()

    const date = {
      after: dayjs(today).subtract(period.value, period.name).startOf(period.name).valueOf(),
      before: dayjs(today).endOf(period.name).valueOf()
    }

    const fromDay = dayjs('12.09.2021').valueOf()
    const toDay = dayjs('12.10.2021').valueOf()

    const dateRange = {
      after: dayjs(fromDay).startOf('day').valueOf(),
      before: dayjs(toDay).endOf('day').valueOf()
    }

    const categories = store.state.categories.items
    const trns = computed(() => store.state.trns.items)
    const trnsIds = computed(() => Object.keys(trns.value))

    const selectedTrnsIds = computed(() => {
      if (!store.getters['trns/hasTrns']) return []
      let ids = []
      ids = filterByDate(trns.value, trnsIds.value, dateRange)
      ids = sortByDate(trns.value, ids)
      return ids
    })

    const chartData = computed(() => {

    })

    return {
      selectedTrnsIds
    }
  }
})
</script>

<template lang="pug">
div
  TrnsItemTrnItem(
    v-for="trnId in selectedTrnsIds"
    :key="trnId"
    :category="$store.state.categories.items[$store.state.trns.items[trnId].categoryId]"
    :trn="$store.state.trns.items[trnId]"
    :trnId="trnId"
    :wallet="$store.state.wallets.items[$store.state.trns.items[trnId].walletId]"
  )

  pre {{ $store.state.trns.items[selectedTrnsIds[0]] }}

  Chart(
    :options="chartData"
  )
</template>

<style lang="stylus" scoped>
//
</style>
