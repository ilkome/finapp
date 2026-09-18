import type { Meta, StoryObj } from '@storybook/vue3-vite'

import categoryList from '~/components/stat/fixtures/categoryList.json'

import ListView from './ListView.vue'

const meta = {
  args: categoryList as any,
  component: ListView,
  title: 'stat/categories/ListView',
} satisfies Meta<typeof ListView>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {}
export const Collapsed: Story = { args: { expandedIds: [] } as any }
