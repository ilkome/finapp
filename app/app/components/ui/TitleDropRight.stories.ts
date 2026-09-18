import type { Meta, StoryObj } from '@storybook/vue3-vite'

import TitleDropRight from './TitleDropRight.vue'

const meta = {
  component: TitleDropRight,
  render: args => ({
    components: { TitleDropRight },
    setup: () => ({ args }),
    template: `<TitleDropRight v-bind="args">Period</TitleDropRight>`,
  }),
  title: 'ui/TitleDropRight',
} satisfies Meta<typeof TitleDropRight>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {}
export const Shown: Story = { args: { isShown: true } }
