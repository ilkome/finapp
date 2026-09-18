import type { Meta, StoryObj } from '@storybook/vue3-vite'

import grid from '~/components/stat/fixtures/categoryGrid.json'

import SelectorGridView from './SelectorGridView.vue'

const meta = {
  args: grid as any,
  component: SelectorGridView,
  title: 'categories/SelectorGridView',
} satisfies Meta<typeof SelectorGridView>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {}
export const WithNewButton: Story = { args: { isShowNew: true } as any }
export const Selected: Story = { args: { selectedIds: ['taxi'] } as any }
