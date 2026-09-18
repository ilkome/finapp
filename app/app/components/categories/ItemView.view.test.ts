import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'

import ItemView from '~/components/categories/ItemView.vue'
import line from '~/components/stat/fixtures/categoryLine.json'

const stubs = { UDropdownMenu: { template: '<div data-dropdown><slot /></div>' } }
const base = { category: line.category, categoryId: 'groceries', parentCategory: line.parentCategory } as any

describe('categoriesItemView', () => {
  it('renders name, icon and either the parent (leaf) or the children count', () => {
    const leaf = mount(ItemView, { global: { stubs }, props: { ...base, isShowParent: true } })
    expect(leaf.text()).toContain('Groceries')
    expect(leaf.text()).toContain('Food')
    expect(leaf.find('[data-icon="lucide:utensils"]').exists()).toBe(true)

    const parent = mount(ItemView, { global: { stubs }, props: { ...base, childrenCount: 3, isShowParent: true } })
    expect(parent.text()).toContain('3')
    expect(parent.text()).not.toContain('Food')
  })

  it('shows the chevron only with children and routes its click to toggle', async () => {
    const leaf = mount(ItemView, { global: { stubs }, props: { ...base, childrenCount: 0, isShowChevron: true } })
    expect(leaf.find('[aria-label="base.toggleExpand"]').exists()).toBe(false)

    const parent = mount(ItemView, { global: { stubs }, props: { ...base, childrenCount: 2, isShowChevron: true } })
    await parent.find('[aria-label="base.toggleExpand"]').trigger('click')
    expect(parent.emitted('toggle')).toHaveLength(1)
    expect(parent.emitted('click')).toBeUndefined()
  })

  it('left-menu layout: a parent row click toggles instead of navigating', async () => {
    const wrapper = mount(ItemView, { global: { stubs }, props: { ...base, childrenCount: 2, leftMenuButton: true, to: '/x' } })
    await wrapper.find('.uiElement').trigger('click')
    expect(wrapper.emitted('toggle')).toHaveLength(1)
    expect(wrapper.find('a').exists()).toBe(false)
  })

  it('highlights from selectedIds when given, else from activeItemId', () => {
    const multi = mount(ItemView, { global: { stubs }, props: { ...base, activeItemId: 'other', selectedIds: ['groceries'] } })
    expect(multi.find('.uiElement').classes()).toContain('z-10')
    const single = mount(ItemView, { global: { stubs }, props: { ...base, activeItemId: 'groceries' } })
    expect(single.find('.uiElement').classes()).toContain('z-10')
  })
})
