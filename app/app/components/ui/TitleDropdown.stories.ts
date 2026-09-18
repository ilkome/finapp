import type { Meta, StoryObj } from '@storybook/vue3-vite'

import TitleDropdown from './TitleDropdown.vue'

const meta = {
  component: TitleDropdown,
  render: args => ({
    components: { TitleDropdown },
    setup: () => ({ args }),
    template: `<TitleDropdown v-bind="args">This month</TitleDropdown>`,
  }),
  title: 'ui/TitleDropdown',
} satisfies Meta<typeof TitleDropdown>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {}
export const Active: Story = { args: { isActive: true } }
