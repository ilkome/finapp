import type { Meta, StoryObj } from '@storybook/vue3-vite'

import Header from './Header.vue'

const meta = {
  component: Header,
  render: args => ({
    components: { Header },
    setup: () => ({ args }),
    template: `<Header v-bind="args">Wallets<template #actions><Icon name="lucide:plus" /></template></Header>`,
  }),
  title: 'ui/Header',
} satisfies Meta<typeof Header>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {}
export const WithBack: Story = { args: { backTo: '/' } }
