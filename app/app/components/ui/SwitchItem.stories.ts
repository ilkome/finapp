import type { Meta, StoryObj } from '@storybook/vue3-vite'

import SwitchItem from './SwitchItem.vue'

const meta = {
  args: { checkboxValue: false, title: 'Show archived wallets' },
  component: SwitchItem,
  title: 'ui/SwitchItem',
} satisfies Meta<typeof SwitchItem>

export default meta
type Story = StoryObj<typeof meta>

export const Off: Story = {}
export const On: Story = { args: { checkboxValue: true } }
export const Busy: Story = { args: { busy: true } }
export const Disabled: Story = { args: { disabled: true } }
