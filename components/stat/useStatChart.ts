import { reactive, computed, watch, useContext } from '@nuxtjs/composition-api'

type MoneyType = 'incomes' | 'expenses'

const state = reactive({
  show: {
    incomes: true,
    expenses: true
  }
})

export default function useStatChart () {
  const { store } = useContext()
  const activeTabStat = computed(() => store.state.ui.activeTabStat)

  function setChart (type: MoneyType, value: boolean): void {
    state.show[type] = value
  }

  function toogle (type: MoneyType): void {
    state.show[type] = !state.show[type]
  }

  function onWatch () {
    watch(activeTabStat, () => {
      switch (activeTabStat.value) {
        case 'incomes':
          setChart('incomes', true)
          setChart('expenses', false)
          break
        case 'expenses':
          setChart('incomes', false)
          setChart('expenses', true)
          break
        case 'details':
          setChart('incomes', true)
          setChart('expenses', true)
          break
      }
    })
  }

  return {
    chartState: state,
    toogleChart: toogle,
    onWatch
  }
}
