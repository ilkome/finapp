import type { Meta, StoryObj } from '@storybook/vue3-vite'

import categoryLine from '~/components/stat/fixtures/categoryLine.json'

import LineView from './LineView.vue'

const meta = {
  args: categoryLine as any,
  component: LineView,
  title: 'stat/categories/LineView',
} satisfies Meta<typeof LineView>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {}
export const WithoutTrend: Story = { args: { isLines: false } as any }
export const CategoryBackground: Story = { args: { backgroundType: 'category' } as any }
