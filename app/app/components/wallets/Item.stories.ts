import type { Meta, StoryObj } from '@storybook/vue3-vite'

import wallets from '~/components/stat/fixtures/wallets.json'

import Item from './Item.vue'

const { wallet, walletId } = wallets.items[0]!

const meta = {
  args: { isShowIcon: true, wallet, walletId } as any,
  component: Item,
  title: 'wallets/Item',
} satisfies Meta<typeof Item>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {}
export const Active: Story = { args: { activeItemId: 'card' } as any }
export const Compact: Story = { args: { compact: true } as any }
export const WithRate: Story = { args: { baseCurrencyCode: 'EUR', isShowBaseRate: true, isShowRate: true, wallet: { ...wallet, rate: 0.92 } } as any }
export const Credit: Story = { args: { isShowCreditLimit: true, wallet: { ...wallet, amount: -420, creditLimit: 2000, name: 'Credit card', type: 'credit' } } as any }
export const WithContextMenu: Story = { args: { contextMenuItems: [[{ icon: 'i-lucide-pencil', label: 'Edit' }]] } as any }
