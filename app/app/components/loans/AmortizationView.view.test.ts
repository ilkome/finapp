import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'

import amortization from '~/components/demo/loans/amortization.json'
import LoansAmortizationView from '~/components/loans/AmortizationView.vue'

const VChart = { props: ['option'], template: '<div data-chart :data-option="JSON.stringify(option)" />' }

describe('loansAmortizationView', () => {
  it('splits every payment into principal and interest, paid ones at full strength', () => {
    const wrapper = mount(LoansAmortizationView, { global: { stubs: { echarts: VChart } }, props: amortization })
    const option = JSON.parse(wrapper.find('[data-chart]').attributes('data-option')!)
    expect(option.series.map((item: { data: { value: number }[] }) => item.data.map(bar => bar.value))).toEqual([[7000, 7100, 7200], [3000, 2900, 2800]])
    expect(option.series[0].data.map((bar: { itemStyle: { opacity: number } }) => bar.itemStyle.opacity)).toEqual([1, 0.35, 0.35])
  })

  it('hides for a single payment', () => {
    const wrapper = mount(LoansAmortizationView, { global: { stubs: { echarts: VChart } }, props: { ...amortization, rows: amortization.rows.slice(0, 1) } })
    expect(wrapper.find('[data-loan-amortization]').exists()).toBe(false)
  })
})
