import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'

import cost from '~/components/demo/loans/cost.json'
import LoansCostView from '~/components/loans/CostView.vue'

describe('loansCostView', () => {
  it('renders the totals and one row per month, with fees only where there are any', () => {
    const wrapper = mount(LoansCostView, { props: cost as any })
    expect(wrapper.findAll('[data-loan-cost-month]')).toHaveLength(2)
    expect(wrapper.findAll('[data-amount]').map(el => el.text())).toEqual([
      '19550.16 RUB',
      '30 RUB',
      '9800.15 RUB',
      '9750.01 RUB',
      '30 RUB',
    ])
  })
})
