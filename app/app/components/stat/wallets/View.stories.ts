import type { Meta, StoryObj } from '@storybook/vue3-vite'

import wallets from '~/components/stat/fixtures/wallets.json'

import View from './View.vue'

const meta = {
  args: wallets as any,
  component: View,
  title: 'stat/wallets/View',
} satisfies Meta<typeof View>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {}
export const NoIcons: Story = { args: { isShowIcon: false } as any }
