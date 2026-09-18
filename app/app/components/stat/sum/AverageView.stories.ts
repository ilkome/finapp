import type { Meta, StoryObj } from '@storybook/vue3-vite'

import AverageView from './AverageView.vue'

const meta = {
  args: { amount: -980, currencyCode: 'USD', type: 'expense' },
  component: AverageView,
  title: 'stat/sum/AverageView',
} satisfies Meta<typeof AverageView>

export default meta
type Story = StoryObj<typeof meta>

export const Expense: Story = {}
export const Income: Story = { args: { amount: 2900, type: 'income' } as any }
export const Net: Story = { args: { amount: 1920, type: 'net' } as any }
