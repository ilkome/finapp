import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'

import ItemView from '~/components/categories/ItemView.vue'
import SearchResultsView from '~/components/filter/SearchResultsView.vue'
import results from '~/components/stat/fixtures/searchResults.json'

const stubs = { UiContextMenuMy: { template: '<div><slot /></div>' } }

describe('filterSearchResultsView', () => {
  it('lists wallets and categories and emits toggles by id', async () => {
    const wrapper = mount(SearchResultsView, { global: { stubs }, props: results as any })
    expect(wrapper.text()).toContain('Dollar card')
    expect(wrapper.findAllComponents(ItemView).map(item => item.props('categoryId'))).toEqual(['groceries', 'taxi'])

    await wrapper.find('.select-none').trigger('click')
    expect(wrapper.emitted('toggleWallet')).toEqual([['card']])
    wrapper.findAllComponents(ItemView)[1]!.vm.$emit('click')
    expect(wrapper.emitted('toggleCategory')).toEqual([['taxi']])
  })

  it('shows the empty state when nothing matched', () => {
    const wrapper = mount(SearchResultsView, { global: { stubs }, props: { ...results, categories: [], wallets: [] } as any })
    expect(wrapper.text()).toBe('search.noResults')
  })
})
