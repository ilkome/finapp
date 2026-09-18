import type { Meta, StoryObj } from '@storybook/vue3-vite'

import categoryLine from '~/components/stat/fixtures/categoryLine.json'

import VerticalView from './VerticalView.vue'

const meta = {
  args: { category: categoryLine.category, item: categoryLine.item, maxCategoryValues: categoryLine.maxCategoryValues } as any,
  component: VerticalView,
  title: 'stat/categories/VerticalView',
} satisfies Meta<typeof VerticalView>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {}
