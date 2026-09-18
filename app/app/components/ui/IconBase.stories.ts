import type { Meta, StoryObj } from '@storybook/vue3-vite'

import IconBase from './IconBase.vue'

const meta = {
  args: { color: '#e0745a', name: 'lucide:utensils' },
  component: IconBase,
  title: 'ui/IconBase',
} satisfies Meta<typeof IconBase>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {}
export const Inverted: Story = { args: { invert: true } }
export const Large: Story = { args: { size: 40 } }
