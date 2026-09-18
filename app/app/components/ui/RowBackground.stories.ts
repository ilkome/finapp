import type { Meta, StoryObj } from '@storybook/vue3-vite'

import RowBackground from './RowBackground.vue'

const meta = {
  args: { color: '#e0745a' },
  component: RowBackground,
  render: args => ({
    components: { RowBackground },
    setup: () => ({ args }),
    template: `<RowBackground v-bind="args"><div class="p-3 text-sm">Row</div></RowBackground>`,
  }),
  title: 'ui/RowBackground',
} satisfies Meta<typeof RowBackground>

export default meta
type Story = StoryObj<typeof meta>

export const None: Story = { args: { type: 'none' } }
export const Standard: Story = { args: { type: 'standard' } }
export const Category: Story = { args: { type: 'category' } }
