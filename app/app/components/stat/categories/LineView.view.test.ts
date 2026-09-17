import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'

import LineView from '~/components/stat/categories/LineView.vue'
import RoundView from '~/components/stat/categories/RoundView.vue'
import VerticalView from '~/components/stat/categories/VerticalView.vue'
import line from '~/components/stat/fixtures/categoryLine.json'

describe('category views render from plain JSON', () => {
  it('line: name, parent, amount, trend bars', () => {
    const wrapper = mount(LineView, { props: line as any })
    expect(wrapper.text()).toContain('Groceries')
    expect(wrapper.text()).toContain('Food')
    expect(wrapper.find('[data-amount]').text()).toBe('-320.5 USD')
    expect(wrapper.findAll('rect')).toHaveLength(4)
    expect(wrapper.attributes('data-stat-category-id')).toBe('groceries')
  })

  it('line: amount click emits amountClick, not click', async () => {
    const wrapper = mount(LineView, { props: line as any })
    await wrapper.find('[data-stat-category-amount]').trigger('click')
    expect(wrapper.emitted('amountClick')).toEqual([['groceries']])
    expect(wrapper.emitted('click')).toBeUndefined()
  })

  it('round and vertical render the same record', () => {
    const { category, currencyCode, item, maxCategoryValues, parentCategory } = line as any
    const round = mount(RoundView, { props: { category, currencyCode, isShowAmount: true, item, parentCategory } })
    expect(round.text()).toContain('Groceries')
    expect(round.find('[data-amount]').text()).toBe('-320.5 USD')

    const vertical = mount(VerticalView, { props: { category, item, maxCategoryValues } })
    expect(vertical.attributes('data-stat-category-quick-view')).toBe('groceries')
    expect(vertical.find('[data-icon]').attributes('data-icon')).toBe('lucide:utensils')
  })
})
