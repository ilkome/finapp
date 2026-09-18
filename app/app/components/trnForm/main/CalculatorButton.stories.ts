import type { Meta, StoryObj } from '@storybook/vue3-vite'

import CalculatorButton from './CalculatorButton.vue'

const meta = {
  component: CalculatorButton,
  render: () => ({
    components: { CalculatorButton },
    template: '<div class="flex gap-2 @container/trnForm"><CalculatorButton>7</CalculatorButton><CalculatorButton>8</CalculatorButton><CalculatorButton>+</CalculatorButton></div>',
  }),
  title: 'trnForm/main/CalculatorButton',
} satisfies Meta<typeof CalculatorButton>

export default meta
type Story = StoryObj<typeof meta>

export const Row: Story = {}
