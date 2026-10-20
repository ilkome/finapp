import type { Meta, StoryObj } from '@storybook/vue3-vite'

import Empty from './Empty.vue'

const meta = {
  component: Empty,
  render: args => ({
    components: { Empty },
    setup: () => ({ args }),
    template: `<Empty v-bind="args">Nothing here yet</Empty>`,
  }),
  title: 'ui/Empty',
} satisfies Meta<typeof Empty>

export default meta
type Story = StoryObj<typeof meta>

export const Text: Story = { args: {} }
export const WithIcon: Story = { args: { icon: 'lucide:inbox' } }
export const WithAction: Story = {
  args: {},
  render: args => ({
    components: { Empty },
    setup: () => ({ args }),
    template: `<Empty v-bind="args">No loans<template #action><button type="button">Add</button></template></Empty>`,
  }),
}
