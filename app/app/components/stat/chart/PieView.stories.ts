import type { Meta, StoryObj } from '@storybook/vue3-vite'

import PieView from './PieView.vue'

const meta = {
  args: { pieData: [{ color: '#e0745a', value: 320 }, { color: '#3b82f6', value: 120 }, { color: '#5ac07a', value: 60 }], typeLabel: 'Expense' },
  component: PieView,
  title: 'stat/chart/PieView',
} satisfies Meta<typeof PieView>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {}
export const Empty: Story = { args: { pieData: [] } as any }
