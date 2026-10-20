import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'

import AxisTooltip from '~/components/stat/chart/AxisTooltip.vue'
import tooltip from '~/components/stat/fixtures/chartTooltip.json'

const stubs = { UiIconBase: { template: '<i data-icon />' } }

describe('statChartAxisTooltip', () => {
  it('renders axis params without a stat config provider', () => {
    const wrapper = mount(AxisTooltip, { global: { stubs }, props: { params: tooltip.params, series: tooltip.series, title: 'Jan' } as any })
    expect(wrapper.text()).toContain('Income')
    expect(wrapper.text()).toContain('Expense')
  })

  it('renders precomputed rows with their description', () => {
    const wrapper = mount(AxisTooltip, { global: { stubs }, props: { isRoundIcon: true, rows: tooltip.rows, title: 'Now' } })
    expect(wrapper.text()).toContain('Now')
    expect(wrapper.text()).toContain('Cash')
    expect(wrapper.text()).toContain('40%')
  })
})
