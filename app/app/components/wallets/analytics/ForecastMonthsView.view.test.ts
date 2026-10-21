import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'

import months from '~/components/stat/fixtures/forecastMonths.json'
import ForecastMonthsView from '~/components/wallets/analytics/ForecastMonthsView.vue'

describe('walletsAnalyticsForecastMonthsView', () => {
  it('lists every month with both scenario balances', () => {
    const wrapper = mount(ForecastMonthsView, { props: months as any })
    expect(wrapper.findAll('[data-forecast-month]')).toHaveLength(2)
    expect(wrapper.find('[data-forecast-month="1794873600000"]').text()).toContain('-1250 USD')
  })

  it('shows both card paths and the interest the minimum adds', () => {
    const wrapper = mount(ForecastMonthsView, { props: months as any })
    expect(wrapper.findAll('[data-forecast-month-cards]')).toHaveLength(1)
    expect(wrapper.find('[data-forecast-month-interest]').text()).toContain('-120 USD')
  })

  it('shows one scenario only when asked', () => {
    const wrapper = mount(ForecastMonthsView, { props: { ...months, scenario: 'withIncome' } as any })
    const text = wrapper.find('[data-forecast-month="1794873600000"]').text()
    expect(text).toContain('11150 USD')
    expect(text).not.toContain('-1250 USD')
  })
})
