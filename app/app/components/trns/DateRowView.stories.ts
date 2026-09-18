import type { Meta, StoryObj } from '@storybook/vue3-vite'

import DateRowView from './DateRowView.vue'

const meta = {
  args: { currencyCode: 'USD', date: 1789084800000, isShowGroupSum: true, sum: { expense: 152, income: 3000 } },
  component: DateRowView,
  title: 'trns/DateRowView',
} satisfies Meta<typeof DateRowView>

export default meta
type Story = StoryObj<typeof meta>

export const WithSum: Story = {}
export const ExpenseOnly: Story = { args: { sum: { expense: 152, income: 0 } } }
export const SingleTrn: Story = { args: { sum: undefined } }
