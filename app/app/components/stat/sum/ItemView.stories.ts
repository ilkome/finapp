import type { Meta, StoryObj } from '@storybook/vue3-vite'

import ItemView from './ItemView.vue'

const meta = {
  args: { amount: -1250.5, currencyCode: 'USD', type: 'expense' },
  component: ItemView,
  title: 'stat/sum/ItemView',
} satisfies Meta<typeof ItemView>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {}
export const Active: Story = { args: { isActive: true } as any }
export const Summary: Story = { args: { title: 'Total', variant: 'summary' } as any }
export const WithAverage: Story = { args: { averageTotal: { day: -42, month: -980 } } as any }
