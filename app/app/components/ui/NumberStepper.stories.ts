import type { Meta, StoryObj } from '@storybook/vue3-vite'

import NumberStepper from './NumberStepper.vue'

const meta = {
  args: { max: 10, min: 0, modelValue: 3 },
  component: NumberStepper,
  title: 'ui/NumberStepper',
} satisfies Meta<typeof NumberStepper>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {}
export const AtMin: Story = { args: { modelValue: 0 } }
