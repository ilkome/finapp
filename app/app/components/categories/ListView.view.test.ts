import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'

import ItemView from '~/components/categories/ItemView.vue'
import ListView from '~/components/categories/ListView.vue'
import rows from '~/components/stat/fixtures/categoryRows.json'

const stubs = {
  UCollapsible: { props: ['open'], template: '<div v-if="open" data-collapsible><slot name="content" /></div>' },
  UiContextMenuMy: { template: '<div><slot /></div>' },
}

describe('categoriesListView', () => {
  it('renders parents, expanded children, and routes toggle and click', async () => {
    const wrapper = mount(ListView, { global: { stubs }, props: { ...rows, isExpandable: true } as any })
    const names = wrapper.findAllComponents(ItemView).map(item => item.props('categoryId'))
    expect(names).toEqual(['food', 'groceries', 'cafe', 'taxi'])

    await wrapper.find('[aria-label="base.toggleExpand"]').trigger('click')
    expect(wrapper.emitted('toggleExpand')).toEqual([['food']])

    wrapper.findAllComponents(ItemView)[3]!.vm.$emit('click')
    expect(wrapper.emitted('click')).toEqual([['taxi']])
  })

  it('hides children of a collapsed parent and renders grid children as pills', () => {
    const collapsed = mount(ListView, { global: { stubs }, props: { ...rows, expandedIds: [] } as any })
    expect(collapsed.findAllComponents(ItemView)).toHaveLength(2)

    const grid = mount(ListView, { global: { stubs }, props: { ...rows, childrenView: 'grid' } as any })
    expect(grid.findAllComponents(ItemView)).toHaveLength(2)
    expect(grid.text()).toContain('Groceries')
  })
})
