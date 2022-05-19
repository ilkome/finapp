const moneyTypes = [{
  id: 'expense',
  type: 0,
}, {
  id: 'income',
  type: 1,
}]

export default function useStat() {
  const { $store } = useNuxtApp()

  const isEmptyStat = computed(() => {
    const statCurrentPeriod = $store.getters['stat/statCurrentPeriod']
    if ($store.state.ui.activeTabStat === 'details')
      return statCurrentPeriod.total === 0
    else if ($store.state.ui.activeTabStat === 'income')
      return statCurrentPeriod.income.total === 0
    else if ($store.state.ui.activeTabStat === 'expense')
      return statCurrentPeriod.expense.total === 0
  })

  return {
    moneyTypes,
    isEmptyStat,
  }
}
