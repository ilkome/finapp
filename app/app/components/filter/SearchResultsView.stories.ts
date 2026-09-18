import type { Meta, StoryObj } from '@storybook/vue3-vite'

import searchResults from '~/components/stat/fixtures/searchResults.json'

import SearchResultsView from './SearchResultsView.vue'

const meta = {
  args: searchResults as any,
  component: SearchResultsView,
  title: 'filter/SearchResultsView',
} satisfies Meta<typeof SearchResultsView>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {}
export const WalletSelected: Story = { args: { pendingCategories: [], pendingWallets: ['card'] } as any }
export const NoResults: Story = { args: { categories: [], wallets: [] } as any }
