import type { Meta, StoryObj } from '@storybook/vue3-vite'

import fixture from '~/components/stat/fixtures/dateRanges.json'

import RangesView from './RangesView.vue'

const meta = {
  args: { ...fixture, view: 'periods' } as any,
  component: RangesView,
  title: 'stat/date/RangesView',
} satisfies Meta<typeof RangesView>

export default meta
type Story = StoryObj<typeof meta>

export const Periods: Story = {}
export const QuickRanges: Story = { args: { optionIds: ['period:day-1', 'period:week-1', 'period:month-1', 'period:year-1'], size: 'xs', view: 'all' } as any }
export const Presets: Story = { args: { presetUnit: 'day', vertical: true, view: 'presets' } as any }
export const Maximum: Story = { args: { isShowRangeAdjust: true, vertical: true, view: 'maximum' } as any }
