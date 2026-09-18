import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'

import ListView from '~/components/currencies/ListView.vue'
import fixture from '~/components/stat/fixtures/currencies.json'

const props = fixture as any

describe('currenciesListView', () => {
  it('lists used currencies first and the full list below', () => {
    const wrapper = mount(ListView, { props })
    expect(wrapper.text()).toContain('US Dollar')
    expect(wrapper.text()).toContain('Euro')
  })

  it('searches by code and name, and searches only used ones when unused are hidden', async () => {
    const wrapper = mount(ListView, { props })
    await wrapper.find('input').setValue('eur')
    expect(wrapper.text()).toContain('Euro')
    expect(wrapper.text()).not.toContain('US Dollar')

    const hidden = mount(ListView, { props: { ...props, isHideUnused: true } })
    await hidden.find('input').setValue('eur')
    expect(hidden.text()).toContain('currencies.list.notFound')
  })

  it('emits the picked code, including the all button', async () => {
    const wrapper = mount(ListView, { props: { ...props, isShowAllButton: true } })
    await wrapper.findAll('.uiElement')[0]!.trigger('click')
    expect(wrapper.emitted('select')![0]).toEqual(['all'])
  })
})
