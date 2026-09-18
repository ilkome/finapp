import type { Meta, StoryObj } from '@storybook/vue3-vite'

import ActionButton from './ActionButton.vue'

const meta = {
  args: { ariaLabel: 'Add' },
  component: ActionButton,
  render: args => ({
    components: { ActionButton },
    setup: () => ({ args }),
    template: `<ActionButton v-bind="args"><Icon v-if="args.variant !== 'text'" name="lucide:plus" />
      <template v-else>Save</template></ActionButton>`,
  }),
  title: 'ui/ActionButton',
} satisfies Meta<typeof ActionButton>

export default meta
type Story = StoryObj<typeof meta>

export const Icon: Story = {}
export const Text: Story = { args: { variant: 'text' } }
export const Active: Story = { args: { isActive: true } }
export const Disabled: Story = { args: { disabled: true } }
