import type { Meta, StoryObj } from '@storybook/vue3-vite'

import chart from '~/components/stat/fixtures/chart.json'

import View from './View.vue'

const meta = {
  args: chart as any,
  component: View,
  title: 'stat/chart/View',
} satisfies Meta<typeof View>

export default meta
type Story = StoryObj<typeof meta>

export const Bar: Story = {}
export const Line: Story = { args: { chartType: 'line' } as any }
