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
      .toEqual(['1216000 RUB', '1520000 RUB', '14000 EUR'])
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
    const wallet = (name: string, currencyCode: string) => ({ color: '#3b82f6', currencyCode, name, sortOrder: 1, type: 'cash' })
    const wrapper = mount(TrnsPreviewView, {
      props: {
        ...trnPreview,
        conversions: [{ currency: 'EUR', now: 50 }],
        hasRatesOnDate: false,
        loan: undefined,
        transferRate: { from: 'USD', now: 100.12345, to: 'RUB', transfer: 90 },
        trnItem: {
          category: { color: '#888', icon: 'lucide:arrow-right-left', name: 'Transfer' },
          createdAt: 1789084800000,
          date: 1789084800000,
          fromAmount: 100,
          fromWallet: wallet('usd', 'USD'),
          fromWalletId: 'usd',
          id: 't2',
          toAmount: 9000,
          toWallet: wallet('rub', 'RUB'),
          toWalletId: 'rub',
          type: 'transfer',
          updatedAt: 1789084800000,
        },
      } as any,
    })
    expect(wrapper.find('[data-preview-rate]').findAll('[data-rate]').map(el => el.text())).toEqual(['90 RUB', '100.1235 RUB'])
    expect(wrapper.text()).toContain('trns.preview.noRatesOnDate')
  })
})
