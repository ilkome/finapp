import type { Meta, StoryObj } from '@storybook/vue3-vite'

import TitleSection from './TitleSection.vue'

const meta = {
  component: TitleSection,
  render: args => ({
    components: { TitleSection },
    setup: () => ({ args }),
    template: `<TitleSection v-bind="args">Wallets</TitleSection>`,
  }),
  title: 'ui/TitleSection',
} satisfies Meta<typeof TitleSection>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {}
export const Small: Story = { args: { size: 'sm' } }
