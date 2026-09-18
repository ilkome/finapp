import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'

import FavoritesView from '~/components/categories/FavoritesView.vue'
import grid from '~/components/stat/fixtures/categoryGrid.json'

const stubs = { UiContextMenuMy: { template: '<div><slot /></div>' } }

describe('categoriesFavoritesView', () => {
  it('titles the sections that have one and forwards select and new', async () => {
    const wrapper = mount(FavoritesView, {
      global: { stubs },
      props: {
        sections: [
          { items: grid.items.slice(0, 2), key: 'favorites', title: 'Favorites' },
          { isShowNew: true, items: grid.items.slice(2), key: 'all' },
        ],
      } as any,
    })

    expect(wrapper.text()).toContain('Favorites')
    expect(wrapper.findAll('button[aria-label="categories.new"]')).toHaveLength(1)

    await wrapper.find('button[aria-label="categories.new"]').trigger('click')
    expect(wrapper.emitted('new')).toHaveLength(1)
  })
})
