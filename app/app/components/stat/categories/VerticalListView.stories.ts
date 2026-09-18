import type { Meta, StoryObj } from '@storybook/vue3-vite'

import categoryList from '~/components/stat/fixtures/categoryList.json'

import VerticalListView from './VerticalListView.vue'

const meta = {
  args: { backgroundType: 'none', currencyCode: 'USD', isShowTooltipChildren: true, maxCategoryValues: categoryList.maxCategoryValues, rows: categoryList.rows, trendType: 'bar' } as any,
  component: VerticalListView,
  title: 'stat/categories/VerticalListView',
} satisfies Meta<typeof VerticalListView>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {}
