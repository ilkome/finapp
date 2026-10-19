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
    expect(wrapper.find('[data-amount]').text()).toBe('15200 USD')
    await wrapper.trigger('click')
    expect(wrapper.emitted('click')).toHaveLength(1)
  })

  it('labels a transfer into a credit wallet as a loan payment', () => {
    const wallet = (id: string, type: string) => ({ color: '#3b82f6', currencyCode: 'USD', name: id, sortOrder: 1, type })
    const transfer = (toType: string) => ({
      trnItem: {
        category: { color: '#888', icon: 'lucide:arrow-right-left', name: 'Transfer' },
        createdAt: 1789084800000,
        date: 1789084800000,
        fromAmount: 10000,
        fromWallet: wallet('card', 'cash'),
        fromWalletId: 'card',
        id: 't2',
        toAmount: 10000,
        toWallet: wallet('target', toType),
        toWalletId: 'target',
        type: 'transfer',
        updatedAt: 1789084800000,
      },
    })
    expect(mount(TrnsItem, { props: transfer('loan') as any }).text()).toContain('trns.types.loanPayment')
    expect(mount(TrnsItem, { props: transfer('credit_card') as any }).text()).not.toContain('trns.types.loanPayment')
    expect(mount(TrnsItem, { props: transfer('cash') as any }).text()).not.toContain('trns.types.loanPayment')
    expect(mount(TrnsItem, { props: transfer('cash') as any }).findAll('[data-amount]').map(el => el.text())).toEqual(['10000 USD'])
  })

  it('names the outside side of a one-sided transfer', () => {
    const wrapper = mount(TrnsItem, {
      props: {
        trnItem: {
          category: { color: '#888', icon: 'lucide:arrow-right-left', name: 'Transfer' },
          createdAt: 1789084800000,
          date: 1789084800000,
          id: 't3',
          toAmount: 5000,
          toWallet: { color: '#3b82f6', currencyCode: 'USD', name: 'Cash', sortOrder: 1, type: 'cash' },
          toWalletId: 'cash',
          type: 'transfer',
          updatedAt: 1789084800000,
        },
      } as any,
    })
    expect(wrapper.text()).toContain('trnForm.transfer.outside')
    expect(wrapper.findAll('[data-amount]').map(el => el.text())).toEqual(['5000 USD'])
  })

  it('group sum renders only non-zero sides', () => {
    const wrapper = mount(TrnsListGroupSum, { props: { currencyCode: 'USD', expense: 4000, income: 0 } })
    expect(wrapper.findAll('[data-amount]').map(el => el.text())).toEqual(['4000 USD'])
  })
})
