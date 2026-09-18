import type { Meta, StoryObj } from '@storybook/vue3-vite'

import SortableSelectionItem from './SortableSelectionItem.vue'

const meta = {
  args: { ariaLabel: 'Dollar card' },
  component: SortableSelectionItem,
  render: args => ({
    components: { SortableSelectionItem },
    setup: () => ({ args }),
    template: `<SortableSelectionItem v-bind="args">Dollar card<template #description>USD</template></SortableSelectionItem>`,
  }),
  title: 'ui/SortableSelectionItem',
} satisfies Meta<typeof SortableSelectionItem>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {}
export const Selected: Story = { args: { isSelected: true } }
export const Multiple: Story = { args: { isSelected: true, selectionMode: 'multiple' } }
