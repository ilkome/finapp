import type { Meta, StoryObj } from '@storybook/vue3-vite'

import ActionButton from './ActionButton.vue'

const meta = {
  args: { icon: 'lucide:plus', label: 'Add block' },
  component: ActionButton,
  title: 'stat/config/ActionButton',
} satisfies Meta<typeof ActionButton>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {}
export const Trailing: Story = { args: { trailingIcon: 'lucide:chevron-down' } }
export const Loading: Story = { args: { loading: true } }
export const Disabled: Story = { args: { disabled: true } }
