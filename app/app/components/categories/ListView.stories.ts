import type { Meta, StoryObj } from '@storybook/vue3-vite'

import categoryRows from '~/components/stat/fixtures/categoryRows.json'

import ListView from './ListView.vue'

const meta = {
  args: { ...categoryRows, isExpandable: true } as any,
  component: ListView,
  title: 'categories/ListView',
} satisfies Meta<typeof ListView>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {}
export const Collapsed: Story = { args: { expandedIds: [] } as any }
export const GridChildren: Story = { args: { childrenView: 'grid' } as any }
export const CategoryBackground: Story = { args: { backgroundType: 'category' } as any }
export const Active: Story = { args: { activeItemId: 'groceries' } as any }
