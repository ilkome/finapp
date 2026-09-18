import type { Meta, StoryObj } from '@storybook/vue3-vite'

import categoryList from '~/components/stat/fixtures/categoryList.json'

import RoundListView from './RoundListView.vue'

const meta = {
  args: { currencyCode: 'USD', rows: categoryList.rows } as any,
  component: RoundListView,
  title: 'stat/categories/RoundListView',
} satisfies Meta<typeof RoundListView>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {}
export const WithAmount: Story = { args: { isShowAmount: true, isShowParent: true } as any }
export const Selected: Story = { args: { selectedIds: ['food'] } as any }
