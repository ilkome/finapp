import type { Meta, StoryObj } from '@storybook/vue3-vite'

import wallets from '~/components/stat/fixtures/wallets.json'

import ItemBody from './ItemBody.vue'

const { wallet, walletId } = wallets.items[0]!

const meta = {
  args: { isShowIcon: true, wallet, walletId } as any,
  component: ItemBody,
  title: 'wallets/ItemBody',
} satisfies Meta<typeof ItemBody>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {}
export const Compact: Story = { args: { compact: true } as any }
export const CreditLimit: Story = { args: { isShowCreditLimit: true, wallet: { ...wallet, amount: -420, creditLimit: 2000, name: 'Credit card', type: 'credit' } } as any }
export const WithRate: Story = { args: { baseCurrencyCode: 'EUR', isShowBaseRate: true, isShowRate: true, wallet: { ...wallet, rate: 0.92 } } as any }
