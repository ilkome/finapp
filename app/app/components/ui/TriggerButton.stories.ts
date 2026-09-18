import type { Meta, StoryObj } from '@storybook/vue3-vite'

import TriggerButton from './TriggerButton.vue'

const meta = {
  args: { icon: 'lucide:filter', title: 'Filter' },
  component: TriggerButton,
  title: 'ui/TriggerButton',
} satisfies Meta<typeof TriggerButton>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {}
export const Active: Story = { args: { isActive: true } }
export const Outlined: Story = { args: { hasSelection: true, outlined: true } }
export const LabelMode: Story = { args: { labelMode: true } }
