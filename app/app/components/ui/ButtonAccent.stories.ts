import type { Meta, StoryObj } from '@storybook/vue3-vite'

import ButtonAccent from './ButtonAccent.vue'

const meta = {
  args: { color: 'primary' },
  component: ButtonAccent,
  render: args => ({
    components: { ButtonAccent },
    setup: () => ({ args }),
    template: `<ButtonAccent v-bind="args">Continue</ButtonAccent>`,
  }),
  title: 'ui/ButtonAccent',
} satisfies Meta<typeof ButtonAccent>

export default meta
type Story = StoryObj<typeof meta>

export const Solid: Story = { args: { variant: 'solid' } }
export const Outline: Story = { args: { variant: 'outline' } }
export const Loading: Story = { args: { loading: true } }
