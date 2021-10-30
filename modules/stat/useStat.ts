import { computed, useContext } from '@nuxtjs/composition-api'

const moneyTypes = [{
  id: 'expenses',
  type: 0
}, {
  id: 'incomes',
  type: 1
}]

export default function useStat () {
  const { store } = useContext()
  const isEmptyStat = computed(() => {
    const statCurrentPeriod = store.getters['stat/statCurrentPeriod']

    if (store.state.ui.activeTabStat === 'details')
      return statCurrentPeriod.total === 0
    else if (store.state.ui.activeTabStat === 'incomes')
      return statCurrentPeriod.incomes.total === 0
    else if (store.state.ui.activeTabStat === 'expenses')
      return statCurrentPeriod.expenses.total === 0
  })

  return {
    moneyTypes,
    isEmptyStat
  }
}
