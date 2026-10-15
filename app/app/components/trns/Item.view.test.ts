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

  it('labels a transfer into a credit wallet as a loan payment', () => {
    const wallet = (id: string, type: string) => ({ color: '#3b82f6', currency: 'USD', id, name: id, order: 1, type })
    const transfer = (incomeType: string) => ({
      trnItem: {
        category: { color: '#888', icon: 'lucide:arrow-right-left', name: 'Transfer' },
        categoryId: 'transfer',
        date: 1789084800000,
        expenseAmount: 100,
        expenseWallet: wallet('card', 'cash'),
        expenseWalletId: 'card',
        id: 't2',
        incomeAmount: 100,
        incomeWallet: wallet('target', incomeType),
        incomeWalletId: 'target',
        type: 2,
        updatedAt: 1789084800000,
      },
    })
    expect(mount(TrnsItem, { props: transfer('loan') as any }).text()).toContain('trns.types.loanPayment')
    expect(mount(TrnsItem, { props: transfer('credit') as any }).text()).toContain('trns.types.loanPayment')
    expect(mount(TrnsItem, { props: transfer('cash') as any }).text()).not.toContain('trns.types.loanPayment')
  })

  it('group sum renders only non-zero sides', () => {
    const wrapper = mount(TrnsListGroupSum, { props: { currencyCode: 'USD', expense: 40, income: 0 } })
    expect(wrapper.findAll('[data-amount]').map(el => el.text())).toEqual(['40 USD'])
  })
})
