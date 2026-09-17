import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'

import VerticalListView from '~/components/stat/categories/VerticalListView.vue'
import VerticalView from '~/components/stat/categories/VerticalView.vue'
import list from '~/components/stat/fixtures/categoryList.json'

const stubs = { UTooltip: { template: '<div data-tooltip><slot /><div data-tooltip-content><slot name="content" /></div></div>' } }
const props = { currencyCode: 'USD', isShowTooltipChildren: true, maxCategoryValues: list.maxCategoryValues, rows: list.rows } as any

describe('statCategoriesVerticalListView', () => {
  it('renders a bar per row and the row plus its children inside the tooltip', () => {
    const wrapper = mount(VerticalListView, { global: { stubs }, props: { ...props, backgroundType: 'none', trendType: 'bar' } })
    expect(wrapper.findAll('[data-stat-category-quick-view]').map(el => el.attributes('data-stat-category-quick-view'))).toEqual(['food', 'taxi'])
    const foodTooltip = wrapper.findAll('[data-tooltip-content]')[0]!
    expect(foodTooltip.findAll('[data-stat-category-id]').map(el => el.attributes('data-stat-category-id'))).toEqual(['food', 'groceries'])
  })

  it('forwards a bar click as select', () => {
    const wrapper = mount(VerticalListView, { global: { stubs }, props: { ...props, backgroundType: 'none', trendType: 'bar' } })
    wrapper.findAllComponents(VerticalView)[1]!.vm.$emit('click', 'taxi')
    expect(wrapper.emitted('select')).toEqual([['taxi']])
  })
})
