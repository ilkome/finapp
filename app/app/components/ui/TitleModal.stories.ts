import type { Meta, StoryObj } from '@storybook/vue3-vite'

import TitleModal from './TitleModal.vue'

const meta = {
  component: TitleModal,
  render: args => ({
    components: { TitleModal },
    setup: () => ({ args }),
    template: `<TitleModal v-bind="args">Edit wallet</TitleModal>`,
  }),
  title: 'ui/TitleModal',
} satisfies Meta<typeof TitleModal>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {}
