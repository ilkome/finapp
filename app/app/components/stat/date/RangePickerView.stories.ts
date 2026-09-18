import type { Meta, StoryObj } from '@storybook/vue3-vite'

import fixture from '~/components/stat/fixtures/dateRanges.json'

import RangePickerView from './RangePickerView.vue'

const meta = {
  args: {
    ...fixture,
    granularity: { granularityBy: 'day', granularityDuration: 1 },
    range: { end: Date.UTC(2026, 8, 30), start: Date.UTC(2026, 8, 1) },
  } as any,
  component: RangePickerView,
  title: 'stat/date/RangePickerView',
} satisfies Meta<typeof RangePickerView>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {}
export const MaxRange: Story = { args: { params: { ...fixture.params, isShowMaxRange: true } } as any }
