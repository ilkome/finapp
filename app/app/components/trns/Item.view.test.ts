import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'

import trn from '~/components/stat/fixtures/trn.json'
import TrnsItem from '~/components/trns/Item.vue'
import TrnsListGroupSum from '~/components/trns/ListGroupSum.vue'

describe('trnsItem', () => {
  it('renders a transaction row from plain JSON and emits click', async () => {
    const wrapper = mount(TrnsItem, { props: trn as any })
    expect(wrapper.text()).toContain('Groceries')
    expect(wrapper.text()).toContain('Weekly groceries')
    expect(wrapper.text()).toContain('Dollar card')
    expect(wrapper.find('[data-amount]').text()).toBe('152 USD')
    await wrapper.trigger('click')
    expect(wrapper.emitted('click')).toHaveLength(1)
  })

  it('group sum renders only non-zero sides', () => {
    const wrapper = mount(TrnsListGroupSum, { props: { currencyCode: 'USD', expense: 40, income: 0 } })
    expect(wrapper.findAll('[data-amount]').map(el => el.text())).toEqual(['40 USD'])
  })
})
