import type { Meta, StoryObj } from '@storybook/vue3-vite'

import ButtonClose from './ButtonClose.vue'

const meta = {
  component: ButtonClose,
  render: args => ({
    components: { ButtonClose },
    setup: () => ({ args }),
    template: `<div class="relative h-16 w-48 rounded-md bg-elevated/30"><ButtonClose v-bind="args" /></div>`,
  }),
  title: 'ui/ButtonClose',
} satisfies Meta<typeof ButtonClose>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {}
