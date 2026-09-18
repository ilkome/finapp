import type { Meta, StoryObj } from '@storybook/vue3-vite'

import chart from '~/components/stat/fixtures/chart.json'

import SimplePieView from './SimplePieView.vue'

const meta = {
  args: { series: chart.series, xAxisLabels: chart.xAxisLabels } as any,
  component: SimplePieView,
  title: 'stat/chart/SimplePieView',
} satisfies Meta<typeof SimplePieView>

export default meta
type Story = StoryObj<typeof meta>

export const Donut: Story = {}
export const Pie: Story = { args: { isDonut: false, isShowPercent: true } as any }
