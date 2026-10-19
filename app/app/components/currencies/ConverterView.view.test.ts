import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'

import ConverterView from '~/components/currencies/ConverterView.vue'
import fixture from '~/components/stat/fixtures/currencyConverter.json'

const props = fixture as any

describe('currenciesConverterView', () => {
  it('shows results, a missing rate and the rates date', () => {
    const text = mount(ConverterView, { props }).text()
    expect(text).toContain('9 510 ₽')
    expect(text).toContain('currencies.converter.noRate')
    expect(text).toContain('currencies.converter.ratesOn')
  })

  it('emits the typed amount and removed targets', async () => {
    const wrapper = mount(ConverterView, { props })
    await wrapper.find('input').setValue('250')
    expect(wrapper.emitted('update:amount')![0]).toEqual(['250'])
    await wrapper.find('button[aria-label="base.delete"]').trigger('click')
    expect(wrapper.emitted('removeTarget')![0]).toEqual(['RUB'])
  })
})
