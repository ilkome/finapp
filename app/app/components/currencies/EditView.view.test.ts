import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'

import EditView from '~/components/currencies/EditView.vue'
import fixture from '~/components/stat/fixtures/currencyEdit.json'

const props = fixture as any

function saveButton(wrapper: ReturnType<typeof mount>) {
  return wrapper.findAll('button').find(b => b.text().includes('base.save'))!
}

describe('currenciesEditView', () => {
  it('locks the scale and delete while a wallet uses the currency', () => {
    const wrapper = mount(EditView, { props })
    expect(wrapper.text()).toContain('currencies.form.usedBy')
    expect(wrapper.findAll('input').some(i => i.attributes('disabled') !== undefined)).toBe(true)
  })

  it('emits the edited currency', async () => {
    const wrapper = mount(EditView, { props })
    await wrapper.findAll('input')[0]!.setValue('Points')
    await saveButton(wrapper).trigger('click')
    expect(wrapper.emitted('save')![0]).toEqual([{ code: 'PTS', manualRate: 0.5, manualRateCurrencyCode: 'RUB', name: 'Points', scale: 0 }])
  })

  it('refuses a new custom currency with a built-in code', async () => {
    const wrapper = mount(EditView, { props: { ...props, isNew: true, usedByWallets: [], value: { code: '' } } })
    await wrapper.findAll('input')[0]!.setValue('usd')
    await saveButton(wrapper).trigger('click')
    expect(wrapper.emitted('save')).toBeUndefined()
    expect(wrapper.text()).toContain('currencies.form.errors.builtInCode')
  })
})
