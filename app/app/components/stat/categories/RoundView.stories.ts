import type { Meta, StoryObj } from '@storybook/vue3-vite'

import categoryLine from '~/components/stat/fixtures/categoryLine.json'

import RoundView from './RoundView.vue'

const meta = {
  args: { category: categoryLine.category, currencyCode: 'USD', isShowAmount: true, item: categoryLine.item, parentCategory: categoryLine.parentCategory } as any,
  component: RoundView,
  title: 'stat/categories/RoundView',
} satisfies Meta<typeof RoundView>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {}
export const IconBackground: Story = { args: { isIconBg: true } as any }
