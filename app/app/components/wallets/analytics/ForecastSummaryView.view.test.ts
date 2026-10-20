import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'

import summary from '~/components/stat/fixtures/forecastSummary.json'
import ForecastSummaryView from '~/components/wallets/analytics/ForecastSummaryView.vue'

describe('walletsAnalyticsForecastSummaryView', () => {
  it('shows the run-out day of each scenario, or that the money lasts', async () => {
    const wrapper = mount(ForecastSummaryView, { props: summary as any })
    const withoutIncome = wrapper.find('[data-forecast-runway="withoutIncome"]').text()
    expect(withoutIncome).toContain('7 months')
    expect(withoutIncome).toContain('1 June 2027')
    expect(wrapper.find('[data-forecast-runway="withIncome"]').text()).toContain('wallets.analytics.forecast.enough')
    await wrapper.find('[data-forecast-start]').trigger('click')
    expect(wrapper.emitted('editWallets')).toHaveLength(1)
  })

  it('shows the next income and why the scenarios coincide', () => {
    const wrapper = mount(ForecastSummaryView, { props: { ...summary, nextIncomeLabel: '10 November', note: 'Income comes after the run-out date' } as any })
    expect(wrapper.find('[data-forecast-next-income]').text()).toContain('10 November')
    expect(wrapper.find('[data-forecast-note]').text()).toContain('after the run-out')
  })

  it('says the money is already short when the run-out day has come', () => {
    const wrapper = mount(ForecastSummaryView, { props: { ...summary, runwayWithoutIncome: { dateLabel: '18 October 2026', durationLabel: null } } as any })
    expect(wrapper.find('[data-forecast-runway="withoutIncome"]').text()).toContain('wallets.analytics.forecast.runOut')
  })
})
