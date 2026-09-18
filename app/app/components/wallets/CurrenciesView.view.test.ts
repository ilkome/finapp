import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'

import CurrenciesView from '~/components/wallets/CurrenciesView.vue'

const props = { currenciesUsed: ['USD', 'EUR'], currencyFiltered: 'all' } as any

describe('walletsCurrenciesView', () => {
  it('prepends the all tab and emits the picked currency', async () => {
    const wrapper = mount(CurrenciesView, { props })
    expect(wrapper.findAll('button').map(b => b.text())).toEqual(['common.all', 'USD', 'EUR'])

    await wrapper.findAll('button')[1]!.trigger('click')
    expect(wrapper.emitted('selectFilterCurrency')).toEqual([['USD']])
  })

  it('marks the filtered currency', () => {
    const wrapper = mount(CurrenciesView, { props: { ...props, currencyFiltered: 'EUR' } })
    expect(wrapper.find('[aria-pressed="true"]').text()).toBe('EUR')
  })
})
