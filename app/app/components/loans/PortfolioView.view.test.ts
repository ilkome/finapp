import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'

import portfolio from '~/components/demo/loans/portfolio.json'
import LoansPortfolioView from '~/components/loans/PortfolioView.vue'

describe('loansPortfolioView', () => {
  it('renders the base-currency totals and one row per loan', () => {
    const wrapper = mount(LoansPortfolioView, { props: portfolio as any })

    expect(wrapper.find('[data-loan-total="remaining"] [data-amount]').text()).toBe('301000 RUB')
    expect(wrapper.find('[data-loan-total="paidInterest"] [data-amount]').text()).toBe('15000 RUB')

    const rows = wrapper.findAll('[data-loan-portfolio-item]')
    expect(rows).toHaveLength(2)
    expect(rows[0]!.attributes('href')).toBe('/wallets/w1')
    expect(rows[0]!.text()).toContain('19.4% / 18%')
    expect(rows[0]!.text()).toContain('72%')
    expect(rows[0]!.text()).toContain('loans.overdue: 2')
    expect(rows[0]!.text()).toContain('15.05.2026')
    expect(rows[1]!.text()).toContain('loans.closed')
  })

  it('shows the empty hint instead of a list', () => {
    const wrapper = mount(LoansPortfolioView, { props: { ...portfolio, items: [] } as any })
    expect(wrapper.findAll('[data-loan-portfolio-item]')).toHaveLength(0)
    expect(wrapper.text()).toContain('loans.portfolio.empty')
  })
})
