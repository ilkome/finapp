import type { Meta, StoryObj } from '@storybook/vue3-vite'

import Select from './Select.vue'

const meta = {
  args: {
    options: [{ label: 'Day', value: 'day' }, { label: 'Week', value: 'week' }, { label: 'Month', value: 'month' }],
    value: 'week',
  },
  component: Select,
  title: 'form/Select',
} satisfies Meta<typeof Select>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {}
