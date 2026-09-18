import type { Meta, StoryObj } from '@storybook/vue3-vite'

import categoryLine from '~/components/stat/fixtures/categoryLine.json'

import ItemView from './ItemView.vue'

const meta = {
  args: { category: categoryLine.category, categoryId: 'groceries', parentCategory: categoryLine.parentCategory } as any,
  component: ItemView,
  title: 'categories/ItemView',
} satisfies Meta<typeof ItemView>

export default meta
type Story = StoryObj<typeof meta>

export const Leaf: Story = {}
export const WithParent: Story = { args: { isShowParent: true } as any }
export const Parent: Story = { args: { childrenCount: 3, isShowChevron: true } as any }
export const ParentExpanded: Story = { args: { childrenCount: 3, isExpanded: true, isShowChevron: true } as any }
export const Active: Story = { args: { activeItemId: 'groceries' } as any }
export const LeftMenu: Story = {
  args: {
    childrenCount: 2,
    contextMenuItems: [[{ icon: 'i-lucide-pencil', label: 'Edit' }, { icon: 'i-lucide-trash', label: 'Delete' }]],
    isShowChevron: true,
    leftMenuButton: true,
  } as any,
}
