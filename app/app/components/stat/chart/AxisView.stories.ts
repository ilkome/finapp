import type { Meta, StoryObj } from '@storybook/vue3-vite'

import chart from '~/components/stat/fixtures/chart.json'

import AxisView from './AxisView.vue'

const meta = {
  args: { chartConfig: chart.chartConfig, chartType: 'bar', period: chart.period, series: chart.series, xAxisLabels: chart.xAxisLabels } as any,
  component: AxisView,
  title: 'stat/chart/AxisView',
} satisfies Meta<typeof AxisView>

export default meta
type Story = StoryObj<typeof meta>

export const Bar: Story = {}
export const Line: Story = { args: { chartType: 'line' } as any }
