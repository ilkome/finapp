import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'

import summary from '~/components/demo/loans/summary.json'
import LoansSummaryView from '~/components/loans/SummaryView.vue'

describe('loansSummaryView', () => {
  it('renders the facts header from plain JSON', () => {
    const wrapper = mount(LoansSummaryView, { props: summary as any })
    expect(wrapper.findAll('[data-amount]').map(el => el.text())).toEqual([
      '54000 RUB',
      '48000 RUB',
      '301000 RUB',
      '12500 RUB',
      '15000 RUB',
    ])
    expect(wrapper.text()).toContain('loans.overpaid')
    expect(wrapper.text()).toContain('24.5%')
    expect(wrapper.find('[data-loan-rate="effective"]').exists()).toBe(true)
    expect(wrapper.text()).toContain('loans.overdue: 2')
    expect(wrapper.text()).not.toContain('loans.closed')
  })

  it('shows both warnings only when they apply', () => {
    const wrapper = mount(LoansSummaryView, { props: summary as any })
    expect(wrapper.find('[data-loan-warning="unrecognized"]').text()).toContain('1200')
    expect(wrapper.find('[data-loan-warning="shortfall"]').exists()).toBe(true)

    return wrapper.setProps({ debitShortfall: null, isClosed: true, unrecognized: 0 }).then(() => {
      expect(wrapper.find('[data-loan-warning="unrecognized"]').exists()).toBe(false)
      expect(wrapper.find('[data-loan-warning="shortfall"]').exists()).toBe(false)
      expect(wrapper.text()).toContain('loans.closed')
      expect(wrapper.text()).not.toContain('loans.plannedOverpayment')
    })
  })

  it('shows only the effective rate when the bank publishes no contract rate', () => {
    const wrapper = mount(LoansSummaryView, { props: { ...summary, contractRate: null, effectiveRate: 27.24 } as any })
    expect(wrapper.find('[data-loan-rate="effective"]').exists()).toBe(true)
    expect(wrapper.text()).not.toContain('24.5%')
  })

  it('asks for the interest of payments recorded without it', async () => {
    const wrapper = mount(LoansSummaryView, { props: summary as any })
    expect(wrapper.find('[data-loan-warning="interestMissing"]').exists()).toBe(false)
    await wrapper.setProps({ interestMissing: 3 })
    expect(wrapper.find('[data-loan-warning="interestMissing"]').exists()).toBe(true)
  })

  it('counts the months that left the debt unchanged', async () => {
    const wrapper = mount(LoansSummaryView, { props: summary as any })
    expect(wrapper.find('[data-loan-warning="principalFree"]').exists()).toBe(false)
    await wrapper.setProps({ principalFreeInterest: 24657.69, principalFreeMonths: 4 })
    expect(wrapper.find('[data-loan-warning="principalFree"]').text()).toContain('24657.69')
  })

  it('shows the bank debt check only once bank sync pushed a figure', async () => {
    const wrapper = mount(LoansSummaryView, { props: summary as any })
    expect(wrapper.find('[data-loan-bank-debt]').exists()).toBe(false)
    await wrapper.setProps({ bankDebt: { date: '22.09.2026', diff: 0, isStale: false } })
    expect(wrapper.find('[data-loan-bank-debt]').text()).toContain('loans.bankDebt.reconciled')
    await wrapper.setProps({ bankDebt: { date: '22.09.2026', diff: 1713.67, isStale: true } })
    expect(wrapper.find('[data-loan-bank-debt]').text()).toContain('1713.67')
    expect(wrapper.find('[data-loan-bank-debt]').classes()).toContain('opacity-60')
  })

  it('hides the effective rate when it matches the contract', () => {
    const wrapper = mount(LoansSummaryView, { props: { ...summary, effectiveRate: null } as any })
    expect(wrapper.find('[data-loan-rate="effective"]').exists()).toBe(false)
  })
})
