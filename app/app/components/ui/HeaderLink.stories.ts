import type { Meta, StoryObj } from '@storybook/vue3-vite'

import HeaderLink from './HeaderLink.vue'

const meta = {
  args: { icon: 'lucide:settings' },
  component: HeaderLink,
  render: args => ({
    components: { HeaderLink },
    setup: () => ({ args }),
    template: `<HeaderLink v-bind="args">Settings</HeaderLink>`,
  }),
  title: 'ui/HeaderLink',
} satisfies Meta<typeof HeaderLink>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {}
