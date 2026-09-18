import type { Meta, StoryObj } from '@storybook/vue3-vite'

import NoTrns from './NoTrns.vue'

const meta = {
  component: NoTrns,
  title: 'trns/NoTrns',
} satisfies Meta<typeof NoTrns>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {}
export const CustomLabel: Story = { args: { label: 'Nothing matches the filter' } }
