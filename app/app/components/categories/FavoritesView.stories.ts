import type { Meta, StoryObj } from '@storybook/vue3-vite'

import grid from '~/components/stat/fixtures/categoryGrid.json'

import FavoritesView from './FavoritesView.vue'

const sections = [
  { items: grid.items.slice(0, 2), key: 'favorites', title: 'Favorite categories' },
  { isShowNew: true, items: grid.items.slice(2), key: 'recent', title: 'Recent categories' },
]

const meta = {
  args: { sections } as any,
  component: FavoritesView,
  title: 'categories/FavoritesView',
} satisfies Meta<typeof FavoritesView>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {}
export const FallbackOnly: Story = { args: { sections: [{ isShowNew: true, items: grid.items, key: 'all' }] } as any }
