import type { Meta, StoryObj } from '@storybook/vue3-vite'

import Tabs from './Tabs.vue'

const meta = {
  args: { items: [{ label: 'Day', value: 'day' }, { label: 'Week', value: 'week' }, { label: 'Month', value: 'month' }], modelValue: 'week' },
  component: Tabs,
  title: 'ui/Tabs',
} satisfies Meta<typeof Tabs>

export default meta
type Story = StoryObj<typeof meta>

export const Pill: Story = {}
export const Link: Story = { args: { variant: 'link' } }
export const Text: Story = { args: { size: 'sm', variant: 'text' } }
