import type { Meta, StoryObj } from '@storybook/vue3-vite'

import ListGroupSum from './ListGroupSum.vue'

const meta = {
  args: { currencyCode: 'USD', expense: -240.5, income: 1200 },
  component: ListGroupSum,
  title: 'trns/ListGroupSum',
} satisfies Meta<typeof ListGroupSum>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {}
export const ExpenseOnly: Story = { args: { income: 0 } }
export const IncomeOnly: Story = { args: { expense: 0 } }
