import type { Meta, StoryObj } from '@storybook/vue3-vite'

import categoryLine from '~/components/stat/fixtures/categoryLine.json'

import RoundPillView from './RoundPillView.vue'

const meta = {
  args: { category: categoryLine.category, parentCategory: categoryLine.parentCategory } as any,
  component: RoundPillView,
  title: 'categories/RoundPillView',
} satisfies Meta<typeof RoundPillView>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {}
export const WithParent: Story = { args: { isShowParent: true } as any }
export const IconBackground: Story = { args: { isIconBg: true } as any }
export const Active: Story = { args: { isActive: true } as any }
