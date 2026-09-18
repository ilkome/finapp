import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'

import sums from '~/components/stat/fixtures/sums.json'
import StatSumView from '~/components/stat/sum/View.vue'

describe('statSumView', () => {
  it('renders every tile with its average from plain JSON', () => {
    const wrapper = mount(StatSumView, { props: sums as any })
    const amounts = wrapper.findAll('[data-amount]').map(el => el.text())
    expect(amounts).toEqual(['-1250.5 USD', '-980 USD', '3000 USD', '2900 USD', '1749.5 USD', '1920 USD'])
    expect(wrapper.text()).toContain('money.expense')
  })

  it('emits the clicked type and renders single mode without tiles', async () => {
    const wrapper = mount(StatSumView, { props: sums as any })
    await wrapper.findAll('.interactive')[1]!.trigger('click')
    expect(wrapper.emitted('click')).toEqual([['income']])

    await wrapper.setProps({ single: { amount: -42, type: 'expense' } })
    expect(wrapper.findAll('[data-amount]').map(el => el.text())).toEqual(['-42 USD'])
    await wrapper.find('.interactive, [class*="min-h-10.5"]').trigger('click')
    expect(wrapper.emitted('clickAverage')).toHaveLength(1)
  })
})
