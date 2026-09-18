import type { Meta, StoryObj } from '@storybook/vue3-vite'

import sums from '~/components/stat/fixtures/sums.json'

import View from './View.vue'

const meta = {
  args: sums as any,
  component: View,
  title: 'stat/sum/View',
} satisfies Meta<typeof View>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {}
export const Single: Story = { args: { single: { amount: -42, type: 'expense' } } as any }
