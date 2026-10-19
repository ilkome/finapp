import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'

import cardLine from '~/components/demo/loans/cardLine.json'
import LoansCardLineView from '~/components/loans/CardLineView.vue'

describe('loansCardLineView', () => {
  it('renders the loan line, the overdue marker and the minimum payment dot', () => {
    const wrapper = mount(LoansCardLineView, { props: cardLine as any })
    expect(wrapper.find('[data-loan-card-line]').text()).toContain('01.10')
    expect(wrapper.find('[data-loan-card-overdue]').exists()).toBe(true)
    expect(wrapper.find('[data-loan-min-status]').attributes('data-loan-min-status')).toBe('overdue')
  })

  it('renders the grace line and the next statement hint only when a statement day is set', () => {
    const wrapper = mount(LoansCardLineView, { props: cardLine as any })
    expect(wrapper.find('[data-loan-card-grace]').text()).toContain('loans.grace.until')
    expect(wrapper.find('[data-loan-card-statement]').text()).toContain('loans.grace.nextStatement')

    const bare = mount(LoansCardLineView, { props: { ...cardLine, grace: { ...cardLine.grace, statementDate: null } } as any })
    expect(bare.find('[data-loan-card-statement]').exists()).toBe(false)
    expect(mount(LoansCardLineView, { props: { ...cardLine, grace: null } as any }).find('[data-loan-card-grace]').exists()).toBe(false)
  })

  it('renders only the minimum payment for a wallet without a loan', () => {
    const wrapper = mount(LoansCardLineView, { props: { ...cardLine, loan: null } as any })
    expect(wrapper.find('[data-loan-card-line]').exists()).toBe(false)
    expect(wrapper.find('[data-loan-card-min]').text()).toContain('25.09')
  })
})
