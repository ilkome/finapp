import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'

import revolving from '~/components/demo/loans/revolving.json'
import LoansRevolvingView from '~/components/loans/RevolvingView.vue'

describe('loansRevolvingView', () => {
  it('renders every card with its min payment status and monthly cost', () => {
    const wrapper = mount(LoansRevolvingView, { props: revolving as any })

    const rows = wrapper.findAll('[data-loan-revolving-item]')
    expect(rows).toHaveLength(2)
    expect(rows[0]!.attributes('href')).toBe('/wallets/r1')
    expect(rows[0]!.find('[data-loan-min-status]').attributes('data-loan-min-status')).toBe('overdue')
    expect(rows[0]!.findAll('[data-loan-revolving-month]')).toHaveLength(2)
    expect(rows[1]!.find('[data-loan-min-status]').exists()).toBe(false)
    expect(rows[1]!.findAll('[data-loan-revolving-month]')).toHaveLength(0)
  })

  it('renders nothing without revolving wallets', () => {
    const wrapper = mount(LoansRevolvingView, { props: { items: [] } })
    expect(wrapper.text()).toBe('')
  })
})
