import type { Meta, StoryObj } from '@storybook/vue3-vite'

import DateHeader from './DateHeader.vue'

const meta = {
  args: { date: Date.UTC(2026, 8, 16) },
  component: DateHeader,
  title: 'trns/DateHeader',
} satisfies Meta<typeof DateHeader>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {}
export const PreviousYear: Story = { args: { date: Date.UTC(2024, 0, 3) } }
