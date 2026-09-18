import type { Meta, StoryObj } from '@storybook/vue3-vite'

import grid from '~/components/stat/fixtures/categoryGrid.json'

import Name from './Name.vue'

const child = grid.items[1]! as any
const parent = grid.items[0]! as any

const meta = {
  args: { category: child.category },
  component: Name,
  title: 'categories/Name',
} satisfies Meta<typeof Name>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {}
export const WithParent: Story = { args: { isShowParent: true, parentCategory: child.parentCategory } }
export const Stacked: Story = { args: { isShowParent: true, parentCategory: child.parentCategory, stacked: true } }
export const WithChildren: Story = { args: { category: parent.category, childrenCount: 2 } }
export const Small: Story = { args: { size: 'xs', suffix: '×3' } }
