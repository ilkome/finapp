import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'

import shares from '~/components/stat/fixtures/analyticsShares.json'
import SharesView from '~/components/wallets/analytics/SharesView.vue'

describe('walletsAnalyticsSharesView', () => {
  it('shows each group with its percent and the total, and emits the picked one', async () => {
    const wrapper = mount(SharesView, { props: shares as any })
    expect(wrapper.findAll('[data-share-percent]').map(el => el.text())).toEqual(['75%', '25%'])
    expect(wrapper.findAll('[data-amount]').at(-1)!.text()).toBe('2000 USD')
    await wrapper.find('[data-share-item="deposit"]').trigger('click')
    expect(wrapper.emitted('select')).toEqual([['deposit']])
  })
})
