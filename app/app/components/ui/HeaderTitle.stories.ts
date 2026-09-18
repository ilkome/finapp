import type { Meta, StoryObj } from '@storybook/vue3-vite'

import HeaderTitle from './HeaderTitle.vue'

const meta = {
  component: HeaderTitle,
  render: args => ({
    components: { HeaderTitle },
    setup: () => ({ args }),
    template: `<HeaderTitle v-bind="args">Statistics</HeaderTitle>`,
  }),
  title: 'ui/HeaderTitle',
} satisfies Meta<typeof HeaderTitle>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {}
