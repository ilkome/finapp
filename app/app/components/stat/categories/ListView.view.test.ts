import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'

import LineView from '~/components/stat/categories/LineView.vue'
import ListView from '~/components/stat/categories/ListView.vue'
import list from '~/components/stat/fixtures/categoryList.json'

const stubs = { UCollapsible: { props: ['open'], template: '<div v-if="open" data-collapsible><slot name="content" /></div>' } }

describe('statCategoriesListView', () => {
  it('renders parents with their expanded children and routes clicks by row kind', async () => {
    const wrapper = mount(ListView, { global: { stubs }, props: list as any })
    const rows = wrapper.findAll('[data-stat-category-id]')
    expect(rows.map(row => row.attributes('data-stat-category-id'))).toEqual(['food', 'groceries', 'taxi'])

    // LineView resolves a click from pointer timing, so drive its own click event directly.
    const lines = wrapper.findAllComponents(LineView)
    lines[0]!.vm.$emit('click', 'food')
    lines[2]!.vm.$emit('click', 'taxi')
    expect(wrapper.emitted('toggleExpand')).toEqual([['food']])
    expect(wrapper.emitted('select')).toEqual([['taxi']])
  })

  it('hides children of a collapsed parent', () => {
    const wrapper = mount(ListView, { global: { stubs }, props: { ...list, expandedIds: [] } as any })
    expect(wrapper.findAll('[data-stat-category-id]').map(row => row.attributes('data-stat-category-id'))).toEqual(['food', 'taxi'])
  })
})
