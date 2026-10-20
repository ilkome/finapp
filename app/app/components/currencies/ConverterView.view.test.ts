import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'

import ConverterView from '~/components/currencies/ConverterView.vue'
import fixture from '~/components/stat/fixtures/currencyConverter.json'

const props = fixture as any

// Renders each menu item as a button so a test can pick one by its label.
const UDropdownMenu = {
  props: ['items'],
  template: '<div><button v-for="item in items.flat()" :key="item.label" type="button" :data-menu-item="item.label" :disabled="item.disabled" @click="item.onSelect()" /></div>',
}

function mountView() {
  return mount(ConverterView, { global: { stubs: { UDropdownMenu, UiContextMenuMy: { template: '<div><slot /></div>' } } }, props })
}

describe('currenciesConverterView', () => {
  it('shows results, a missing rate and the rates date', () => {
    const text = mountView().text()
    expect(text).toContain('9 510 ₽')
    expect(text).toContain('currencies.converter.noRate')
    expect(text).toContain('currencies.converter.ratesOn')
  })

  it('emits the typed amount', async () => {
    const wrapper = mountView()
    await wrapper.find('input').setValue('250')
    expect(wrapper.emitted('update:amount')![0]).toEqual(['250'])
  })

  it('row menu deletes and moves a target', async () => {
    const wrapper = mountView()
    const row = wrapper.find('[data-converter-row="RUB"]')
    expect(row.find('[data-menu-item="currencies.converter.moveUp"]').attributes('disabled')).toBeDefined()
    await row.find('[data-menu-item="currencies.converter.moveDown"]').trigger('click')
    expect(wrapper.emitted('moveTarget')![0]).toEqual(['RUB', 1])
    await row.find('[data-menu-item="base.delete"]').trigger('click')
    expect(wrapper.emitted('removeTarget')![0]).toEqual(['RUB'])
  })
})
