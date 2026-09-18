import type { Meta, StoryObj } from '@storybook/vue3-vite'

import EntityName from './EntityName.vue'

const meta = {
  component: EntityName,
  render: args => ({
    components: { EntityName },
    setup: () => ({ args }),
    template: `<EntityName v-bind="args">Groceries and household</EntityName>`,
  }),
  title: 'ui/EntityName',
} satisfies Meta<typeof EntityName>

export default meta
type Story = StoryObj<typeof meta>

export const Primary: Story = {}
export const Secondary: Story = { args: { variant: 'secondary' } }
export const Heading: Story = { args: { variant: 'heading' } }
export const Compact: Story = { args: { variant: 'compact' } }
