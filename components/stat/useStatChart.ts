import { storeToRefs } from 'pinia'
import { useAppNav } from '~/components/app/useAppNav'

type MoneyType = 'income' | 'expense' | 'sum'

const state = reactive({
  show: {
    income: true,
    expense: true,
    sum: false,
  },
})

export default function useStatChart() {
  const { activeTabStat } = storeToRefs(useAppNav())

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
        case 'summary':
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
