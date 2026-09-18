import type { Meta, StoryObj } from '@storybook/vue3-vite'

import IntervalSelect from './IntervalSelect.vue'

const meta = {
  args: { period: 'day', range: { end: Date.UTC(2026, 8, 30), start: Date.UTC(2026, 8, 1) } },
  component: IntervalSelect,
  title: 'stat/chart/IntervalSelect',
} satisfies Meta<typeof IntervalSelect>

export default meta
type Story = StoryObj<typeof meta>

export const Month: Story = {}
export const Year: Story = { args: { period: 'month', range: { end: Date.UTC(2026, 11, 31), start: Date.UTC(2026, 0, 1) } } }
