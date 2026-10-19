import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'

import legend from '~/components/stat/fixtures/analyticsLegend.json'
import LegendView from '~/components/wallets/analytics/LegendView.vue'

describe('walletsAnalyticsLegendView', () => {
  it('renders the series with their value and change, and toggles one', async () => {
    const wrapper = mount(LegendView, { props: legend as any })
    expect(wrapper.text()).toContain('Cash')
    expect(wrapper.findAll('[data-amount]').map(el => el.text())).toEqual(['1500 USD', '120 USD', '-300 USD'])
    expect(wrapper.find('[data-legend-item="credit_card"]').attributes('aria-pressed')).toBe('false')
    await wrapper.find('[data-legend-item="credit_card"]').trigger('click')
    expect(wrapper.emitted('toggle')).toEqual([['credit_card']])
  })

  it('does not toggle when the legend is read-only', async () => {
    const wrapper = mount(LegendView, { props: { ...legend, isToggleable: false } as any })
    await wrapper.find('[data-legend-item="cash"]').trigger('click')
    expect(wrapper.emitted('toggle')).toBeUndefined()
  })
})
