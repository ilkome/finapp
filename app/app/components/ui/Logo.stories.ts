import type { Meta, StoryObj } from '@storybook/vue3-vite'

import Logo from './Logo.vue'

const meta = {
  component: Logo,
  title: 'ui/Logo',
} satisfies Meta<typeof Logo>

export default meta
type Story = StoryObj<typeof meta>

export const Small: Story = {}
export const Large: Story = { args: { size: 'lg' } }
