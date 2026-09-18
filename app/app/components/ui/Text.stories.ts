import type { Meta, StoryObj } from '@storybook/vue3-vite'

import Text from './Text.vue'

const meta = {
  component: Text,
  render: args => ({
    components: { Text },
    setup: () => ({ args }),
    template: `<Text v-bind="args">Text sample</Text>`,
  }),
  title: 'ui/Text',
} satisfies Meta<typeof Text>

export default meta
type Story = StoryObj<typeof meta>

export const Display: Story = { args: { variant: 'display' } }
export const Section: Story = { args: { variant: 'section' } }
export const Control: Story = { args: { variant: 'control' } }
export const Navigation: Story = { args: { variant: 'navigation' } }
export const MetaText: Story = { args: { variant: 'meta' } }
export const Caption: Story = { args: { variant: 'caption' } }
