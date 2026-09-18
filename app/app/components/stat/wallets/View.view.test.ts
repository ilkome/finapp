import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'

import wallets from '~/components/stat/fixtures/wallets.json'
import StatWalletsView from '~/components/stat/wallets/View.vue'

describe('statWalletsView', () => {
  it('renders period totals per wallet and emits the clicked id', async () => {
    const wrapper = mount(StatWalletsView, { props: wallets as any })
    expect(wrapper.text()).toContain('Dollar card')
    expect(wrapper.text()).toContain('Euro cash')
    expect(wrapper.findAll('[data-amount]').map(el => el.text())).toEqual(['-420.5 USD', '300 EUR'])
    await wrapper.findAll('.uiElement, [class*="uiElement"]').at(-1)!.trigger('click')
    expect(wrapper.emitted('select')?.at(-1)).toEqual(['cash'])
  })
})
