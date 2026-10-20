import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'

import summary from '~/components/stat/fixtures/analyticsSummary.json'
import SummaryTilesView from '~/components/wallets/analytics/SummaryTilesView.vue'

describe('walletsAnalyticsSummaryTilesView', () => {
  it('renders amounts, texts and captions', () => {
    const wrapper = mount(SummaryTilesView, { props: summary })
    expect(wrapper.find('[data-summary-tile="savingsRate"]').text()).toContain('25%')
    expect(wrapper.find('[data-summary-tile="best"]').text()).toContain('1200 USD')
    expect(wrapper.find('[data-summary-tile="best"]').text()).toContain('March 2026')
  })
})
