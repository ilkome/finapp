import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'

import obligations from '~/components/stat/fixtures/obligations.json'
import ObligationsView from '~/components/wallets/analytics/ObligationsView.vue'

describe('walletsAnalyticsObligationsView', () => {
  it('lists each product with its next payment and the horizon total', async () => {
    const wrapper = mount(ObligationsView, { props: obligations as any })
    expect(wrapper.find('[data-obligation="car"]').text()).toContain('25 Oct')
    expect(wrapper.find('[data-obligation="car"]').text()).toContain('-3600 USD')
    await wrapper.find('[data-obligation="visa"]').trigger('click')
    expect(wrapper.emitted('select')).toEqual([['visa']])
  })

  it('says there is nothing to pay', () => {
    const wrapper = mount(ObligationsView, { props: { ...obligations, items: [] } as any })
    expect(wrapper.find('[data-obligations-empty]').exists()).toBe(true)
  })
})
