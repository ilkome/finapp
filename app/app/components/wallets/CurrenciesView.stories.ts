import type { Meta, StoryObj } from '@storybook/vue3-vite'

import CurrenciesView from './CurrenciesView.vue'

const meta = {
  args: { currenciesUsed: ['USD', 'EUR', 'RUB'], currencyFiltered: 'all' },
  component: CurrenciesView,
  title: 'wallets/CurrenciesView',
} satisfies Meta<typeof CurrenciesView>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {}
export const Selected: Story = { args: { currencyFiltered: 'EUR' } as any }
export const MenuStyle: Story = { args: { menuStyle: true } as any }
