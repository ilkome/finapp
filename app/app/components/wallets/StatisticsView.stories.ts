import type { Meta, StoryObj } from '@storybook/vue3-vite'

import fixture from '~/components/stat/fixtures/walletsStatistics.json'

import StatisticsView from './StatisticsView.vue'

const meta = {
  args: fixture as any,
  component: StatisticsView,
  title: 'wallets/StatisticsView',
} satisfies Meta<typeof StatisticsView>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {}
export const Active: Story = { args: { activeType: 'cash' } as any }
export const PinsOnly: Story = { args: { isShowList: false } as any }
export const Collapsed: Story = { args: { isShown: false } as any }
