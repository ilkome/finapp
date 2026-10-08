import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'

import portfolio from '~/components/demo/loans/portfolio.json'
import LoansPortfolioView from '~/components/loans/PortfolioView.vue'

describe('loansPortfolioView', () => {
  it('renders the base-currency totals and the open loans, closed ones on demand', async () => {
    const wrapper = mount(LoansPortfolioView, { props: portfolio as any })

    expect(wrapper.find('[data-loan-total="remaining"] [data-amount]').text()).toBe('301000 RUB')
    expect(wrapper.find('[data-loan-total="paidInterest"]').exists()).toBe(false)

    const rows = wrapper.findAll('[data-loan-portfolio-item]')
    expect(rows).toHaveLength(1)
    expect(rows[0]!.attributes('href')).toBe('/wallets/w1')
    expect(rows[0]!.text()).toContain('18%')
    expect(rows[0]!.find('[data-loan-rate="effective"]').exists()).toBe(true)
    expect(rows[0]!.text()).toContain('loans.overdue: 2')
    expect(rows[0]!.text()).toContain('15.05.2026')

    await wrapper.find('[data-loan-show-closed]').trigger('click')
    const all = wrapper.findAll('[data-loan-portfolio-item]')
    expect(all).toHaveLength(2)
    expect(all[1]!.text()).toContain('loans.closed')
    expect(all[1]!.find('[data-loan-period]').text()).toBe('10.03.2022 - 15.04.2026')
  })

  it('shows the empty hint instead of a list', () => {
    const wrapper = mount(LoansPortfolioView, { props: { ...portfolio, items: [] } as any })
    expect(wrapper.findAll('[data-loan-portfolio-item]')).toHaveLength(0)
    expect(wrapper.text()).toContain('loans.portfolio.empty')
    expect(wrapper.find('[data-loan-show-closed]').exists()).toBe(false)
  })

  it('shows the payments against income only when there is income', async () => {
    const wrapper = mount(LoansPortfolioView, { props: portfolio as any })
    expect(wrapper.find('[data-loan-dti]').exists()).toBe(false)
    await wrapper.setProps({ debtToIncome: { payments: 30000, share: 0.31 } })
    expect(wrapper.find('[data-loan-dti]').text()).toContain('30000')
  })
})
