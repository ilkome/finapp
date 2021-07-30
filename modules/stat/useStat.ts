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
  const isEmptyStat = computed(() => store.getters['stat/statAverage'].total === 0 && store.getters['stat/statAverage'].incomes === 0 && store.getters['stat/statAverage'].expenses === 0)

  return {
    moneyTypes,
    isEmptyStat
  }
}
