import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'

import movers from '~/components/stat/fixtures/analyticsMovers.json'
import MoversView from '~/components/wallets/analytics/MoversView.vue'

describe('walletsAnalyticsMoversView', () => {
  it('lists the movers with their change and opens one', async () => {
    const wrapper = mount(MoversView, { props: movers as any })
    expect(wrapper.find('[data-mover="food"]').text()).toContain('+50%')
    expect(wrapper.find('[data-mover="food"] [data-mover-one-off]').exists()).toBe(false)
    expect(wrapper.find('[data-mover="gym"] [data-mover-one-off]').exists()).toBe(true)
    await wrapper.find('[data-mover="gym"]').trigger('click')
    expect(wrapper.emitted('select')).toEqual([['gym']])
  })
})
