type MoneyType = 'income' | 'expense'

const state = reactive({
  show: {
    income: true,
    expense: true,
  },
})

export default function useStatChart() {
  const { $store } = useNuxtApp()
  const activeTabStat = computed(() => $store.state.ui.activeTabStat)

  function setChart(type: MoneyType, value: boolean): void {
    state.show[type] = value
  }

  function toggle(type: MoneyType): void {
    state.show[type] = !state.show[type]
  }

  function onWatch() {
    watch(activeTabStat, () => {
      switch (activeTabStat.value) {
        case 'income':
          setChart('income', true)
          setChart('expense', false)
          break
        case 'expense':
          setChart('income', false)
          setChart('expense', true)
          break
        case 'details':
          setChart('income', true)
          setChart('expense', true)
          break
        case 'trns':
          setChart('income', true)
          setChart('expense', true)
          break
      }
    })
  }

  return {
    chartState: state,
    toggleChart: toggle,
    onWatch,
  }
}
