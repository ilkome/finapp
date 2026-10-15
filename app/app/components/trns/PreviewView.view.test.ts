import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'

import trnPreview from '~/components/stat/fixtures/trnPreview.json'
import TrnsPreviewView from '~/components/trns/PreviewView.vue'

describe('trnsPreviewView', () => {
  it('renders every detail of a transaction from plain JSON', () => {
    const wrapper = mount(TrnsPreviewView, { props: trnPreview as any })
    expect(wrapper.text()).toContain('Groceries')
    expect(wrapper.find('[data-preview-desc]').text()).toBe('Weekly groceries')
    expect(wrapper.text()).toContain('Dollar card')
    expect(wrapper.find('[data-preview-loan]').attributes('label')).toContain('Car loan')
    expect(wrapper.find('[data-preview-conversions]').findAll('[data-amount]').map(el => el.text()))
      .toEqual(['12160 RUB', '15200 RUB', '140 EUR'])
  })

  it('emits the row actions', async () => {
    const wrapper = mount(TrnsPreviewView, { props: trnPreview as any })
    await wrapper.find('[data-preview-edit]').trigger('click')
    await wrapper.find('[data-preview-delete]').trigger('click')
    await wrapper.find('[data-preview-loan]').trigger('click')
    expect(wrapper.emitted('edit')).toHaveLength(1)
    expect(wrapper.emitted('delete')).toHaveLength(1)
    expect(wrapper.emitted('openWallet')).toEqual([['card']])
  })

  it('shows the transfer rate and hides the day column without history', () => {
    const wallet = (id: string, currency: string) => ({ color: '#3b82f6', currency, id, name: id, order: 1, type: 'cash' })
    const wrapper = mount(TrnsPreviewView, {
      props: {
        ...trnPreview,
        conversions: [{ currency: 'EUR', now: 0.5 }],
        hasRatesOnDate: false,
        loan: undefined,
        transferRate: { from: 'USD', now: 100, to: 'RUB', transfer: 90 },
        trnItem: {
          category: { color: '#888', icon: 'lucide:arrow-right-left', name: 'Transfer' },
          categoryId: 'transfer',
          date: 1789084800000,
          expenseAmount: 1,
          expenseWallet: wallet('usd', 'USD'),
          expenseWalletId: 'usd',
          id: 't2',
          incomeAmount: 90,
          incomeWallet: wallet('rub', 'RUB'),
          incomeWalletId: 'rub',
          type: 2,
          updatedAt: 1789084800000,
        },
      } as any,
    })
    expect(wrapper.find('[data-preview-rate]').findAll('[data-amount]').map(el => el.text())).toEqual(['90 RUB', '100 RUB'])
    expect(wrapper.text()).toContain('trns.preview.noRatesOnDate')
  })
})
