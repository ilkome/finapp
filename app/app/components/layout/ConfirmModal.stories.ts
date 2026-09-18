import type { Meta, StoryObj } from '@storybook/vue3-vite'

import ConfirmModal from './ConfirmModal.vue'

const meta = {
  args: { description: 'This removes the wallet and every transaction in it.', title: 'Delete wallet?' },
  component: ConfirmModal,
  // The modal teleports to <body>; the caption keeps the canvas non-empty for the smoke test.
  render: args => ({
    components: { ConfirmModal },
    setup: () => ({ args }),
    template: '<p class="text-sm text-muted">Modal is open over the canvas.</p><ConfirmModal v-bind="args" />',
  }),
  title: 'layout/ConfirmModal',
} satisfies Meta<typeof ConfirmModal>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {}
export const Highlighted: Story = { args: { confirmLabel: 'Delete', highlight: '12 transactions' } }
export const TitleOnly: Story = { args: { description: undefined } }
