import type { Meta, StoryObj } from '@storybook/vue3-vite'

import Badge from './Badge.vue'

const meta = {
  args: { tone: 'muted' },
  component: Badge,
  render: args => ({
    components: { Badge },
    setup: () => ({ args }),
    template: `<Badge v-bind="args">Badge</Badge>`,
  }),
  title: 'ui/Badge',
} satisfies Meta<typeof Badge>

export default meta
type Story = StoryObj<typeof meta>

export const Muted: Story = {}
export const Warning: Story = { args: { tone: 'warning' } }
export const Error: Story = { args: { tone: 'error' } }
