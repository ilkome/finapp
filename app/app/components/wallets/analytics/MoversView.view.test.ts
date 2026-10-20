import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'

import movers from '~/components/stat/fixtures/analyticsMovers.json'
import MoversView from '~/components/wallets/analytics/MoversView.vue'

describe('walletsAnalyticsMoversView', () => {
  it('lists the movers with their change and opens one', async () => {
    const wrapper = mount(MoversView, { props: movers })
    expect(wrapper.find('[data-mover="food"]').text()).toContain('+50%')
    await wrapper.find('[data-mover="gym"]').trigger('click')
    expect(wrapper.emitted('select')).toEqual([['gym']])
  })
})
