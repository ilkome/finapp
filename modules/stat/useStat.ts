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
    const total = store.getters['stat/statAverage'].total === 0
    const incomes = store.getters['stat/statAverage'].incomes === 0
    const expenses = store.getters['stat/statAverage'].expenses === 0

    return total && incomes && expenses
  })

  return {
    moneyTypes,
    isEmptyStat
  }
}
