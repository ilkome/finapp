import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'

import table from '~/components/stat/fixtures/analyticsWalletsTable.json'
import WalletsTableView from '~/components/wallets/analytics/WalletsTableView.vue'

describe('walletsAnalyticsWalletsTableView', () => {
  it('sorts by a column and opens a wallet', async () => {
    const wrapper = mount(WalletsTableView, { props: table as any })
    const order = () => wrapper.findAll('[data-wallet-row]').map(row => row.attributes('data-wallet-row'))
    expect(order()).toEqual(['bank', 'cash'])
    await wrapper.find('[data-sort="change"]').trigger('click')
    expect(order()).toEqual(['cash', 'bank'])
    await wrapper.find('[data-sort="name"]').trigger('click')
    expect(order()).toEqual(['bank', 'cash'])
    await wrapper.find('[data-wallet-row="cash"] .uiElement').trigger('click')
    await wrapper.find('[data-wallet-row="bank"] [role="button"]').trigger('keydown', { key: 'Enter' })
    expect(wrapper.emitted('select')).toEqual([['cash'], ['bank']])
    expect(wrapper.find('[data-wallet-row="cash"] svg').attributes('aria-label')).toBe('wallets.analytics.table.trend.up')
  })
})
