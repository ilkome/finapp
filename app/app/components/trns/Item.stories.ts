import type { Meta, StoryObj } from '@storybook/vue3-vite'

import trn from '~/components/stat/fixtures/trn.json'

import Item from './Item.vue'

const meta = {
  args: trn as any,
  component: Item,
  title: 'trns/Item',
} satisfies Meta<typeof Item>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {}
export const Compact: Story = { args: { compact: true } as any }
export const Active: Story = { args: { isActive: true } as any }
export const Income: Story = { args: { trnItem: { ...trn.trnItem, categoryId: 'salary', description: 'Salary', fromAmount: undefined, fromWallet: undefined, fromWalletId: undefined, toAmount: 300000, toWallet: trn.trnItem.fromWallet, toWalletId: 'card', type: 'income' } } as any }
