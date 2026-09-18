import type { Meta, StoryObj } from '@storybook/vue3-vite'

import TitleCollapse from './TitleCollapse.vue'

const meta = {
  component: TitleCollapse,
  render: args => ({
    components: { TitleCollapse },
    setup: () => ({ args }),
    template: `<TitleCollapse v-bind="args">Categories</TitleCollapse>`,
  }),
  title: 'ui/TitleCollapse',
} satisfies Meta<typeof TitleCollapse>

export default meta
type Story = StoryObj<typeof meta>

export const Collapsed: Story = {}
export const Expanded: Story = { args: { isShown: true } }
export const NoArrow: Story = { args: { isHideArrow: true } }
