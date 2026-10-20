import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'

import PageListView from '~/components/currencies/PageListView.vue'
import fixture from '~/components/stat/fixtures/currencyRows.json'

const props = fixture as any

describe('currenciesPageListView', () => {
  it('shows rates, manual marks, decimals settings and missing rates', () => {
    const text = mount(PageListView, { props }).text()
    expect(text).toContain('95.10')
    expect(text).toContain('currencies.form.manualShort')
    expect(text).toContain('currencies.form.minorDisplay.never')
    expect(text).toContain('currencies.converter.noRate')
  })

  it('searches by code and name and emits edit and add', async () => {
    const wrapper = mount(PageListView, { props })
    await wrapper.find('input').setValue('bonus')
    expect(wrapper.text()).toContain('PTS')
    expect(wrapper.text()).not.toContain('USD')
    await wrapper.find('.uiElement').trigger('click')
    expect(wrapper.emitted('edit')![0]).toEqual(['PTS'])
    await wrapper.find('button').trigger('click')
    expect(wrapper.emitted('add')).toHaveLength(1)
  })
  it('lists the currencies held by wallets first, under their own title', () => {
    const rows = props.rows.map((row: any, index: number) => ({ ...row, isUsed: index === props.rows.length - 1 }))
    const wrapper = mount(PageListView, { props: { rows } })
    const used = wrapper.find('[data-currency-group="used"]')
    expect(used.text()).toContain('currencies.page.used')
    expect(used.text()).toContain(rows.at(-1).code)
    expect(wrapper.find('[data-currency-group="others"]').exists()).toBe(true)
  })
})
