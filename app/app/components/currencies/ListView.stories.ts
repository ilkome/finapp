import type { Meta, StoryObj } from '@storybook/vue3-vite'

import fixture from '~/components/stat/fixtures/currencies.json'

import ListView from './ListView.vue'

const meta = {
  args: fixture as any,
  component: ListView,
  title: 'currencies/ListView',
} satisfies Meta<typeof ListView>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {}
export const WithAllButton: Story = { args: { active: 'USD', isShowAllButton: true } as any }
export const UsedOnly: Story = { args: { isHideUnused: true } as any }
