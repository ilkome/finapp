import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'

import ItemView from '~/components/categories/ItemView.vue'
import SelectorGridView from '~/components/categories/SelectorGridView.vue'
import grid from '~/components/stat/fixtures/categoryGrid.json'

const stubs = { UiContextMenuMy: { template: '<div><slot /></div>' } }

describe('categoriesSelectorGridView', () => {
  it('selects a leaf but not a parent with children', () => {
    const wrapper = mount(SelectorGridView, { global: { stubs }, props: { ...grid } as any })
    const items = wrapper.findAllComponents(ItemView)

    items[0]!.vm.$emit('click')
    expect(wrapper.emitted('selected')).toBeUndefined()

    items[2]!.vm.$emit('click')
    expect(wrapper.emitted('selected')).toEqual([['taxi']])
  })

  it('shows the new-category button only when asked', async () => {
    const without = mount(SelectorGridView, { global: { stubs }, props: { ...grid } as any })
    expect(without.find('button[aria-label="categories.new"]').exists()).toBe(false)

    const wrapper = mount(SelectorGridView, { global: { stubs }, props: { ...grid, isShowNew: true } as any })
    await wrapper.find('button[aria-label="categories.new"]').trigger('click')
    expect(wrapper.emitted('new')).toHaveLength(1)
  })
})
