import type { Meta, StoryObj } from '@storybook/vue3-vite'

import Icon from './Icon.vue'

const meta = {
  args: { color: '#3b82f6', name: 'Dollar card' },
  component: Icon,
  title: 'wallets/Icon',
} satisfies Meta<typeof Icon>

export default meta
type Story = StoryObj<typeof meta>

export const TwoWords: Story = {}
export const OneWord: Story = { args: { color: '#22c55e', name: 'Cash' } }
