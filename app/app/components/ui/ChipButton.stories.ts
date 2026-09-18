import type { Meta, StoryObj } from '@storybook/vue3-vite'

import ChipButton from './ChipButton.vue'

const meta = {
  args: { ariaLabel: 'Chip' },
  component: ChipButton,
  render: args => ({
    components: { ChipButton },
    setup: () => ({ args }),
    template: `<ChipButton v-bind="args">Chip</ChipButton>`,
  }),
  title: 'ui/ChipButton',
} satisfies Meta<typeof ChipButton>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {}
