import type { Meta, StoryObj } from '@storybook/vue3-vite'

import Switch from './Switch.vue'

const meta = {
  args: { title: 'Show archived', value: false },
  component: Switch,
  title: 'form/Switch',
} satisfies Meta<typeof Switch>

export default meta
type Story = StoryObj<typeof meta>

export const Off: Story = {}
export const On: Story = { args: { value: true } }
export const NoTitle: Story = { args: { title: undefined, value: true } }
