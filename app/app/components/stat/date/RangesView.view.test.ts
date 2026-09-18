import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'

import RangesView from '~/components/stat/date/RangesView.vue'
import fixture from '~/components/stat/fixtures/dateRanges.json'

const props = fixture as any

function labels(wrapper: ReturnType<typeof mount>) {
  return wrapper.findAll('button').map(button => button.text())
}

describe('statDateRangesView', () => {
  it('filters by view and preset unit and marks the selected period', () => {
    const periods = mount(RangesView, { props: { ...props, view: 'periods' } })
    expect(labels(periods)).toEqual(['Day', 'Week', 'Month', 'Year'])
    expect(periods.find('[aria-pressed="true"]').text()).toBe('Month')

    const presets = mount(RangesView, { props: { ...props, presetUnit: 'day', view: 'presets' } })
    expect(labels(presets)).toEqual(['7 days'])
  })

  it('orders and limits by optionIds and emits the picked option', async () => {
    const wrapper = mount(RangesView, { props: { ...props, optionIds: ['period:year-1', 'period:day-1'], view: 'all' } })
    expect(labels(wrapper)).toEqual(['Year', 'Day'])

    await wrapper.findAll('button')[0]!.trigger('click')
    expect(wrapper.emitted('select')![0]![0]).toMatchObject({ id: 'period:year-1' })
  })

  it('highlights the maximum option only while isShowMaxRange is on', () => {
    const off = mount(RangesView, { props: { ...props, view: 'maximum' } })
    expect(off.find('[aria-pressed="true"]').exists()).toBe(false)

    const on = mount(RangesView, { props: { ...props, params: { ...props.params, isShowMaxRange: true }, view: 'maximum' } })
    expect(on.find('[aria-pressed="true"]').text()).toBe('All')
  })

  it('shows the duration stepper only when the range is not maximum', async () => {
    const wrapper = mount(RangesView, { props: { ...props, isShowRangeAdjust: true, view: 'periods' } })
    const plus = wrapper.findAll('button').at(-1)!
    await plus.trigger('click')
    expect(wrapper.emitted('updateRangeDuration')).toEqual([[2]])

    const maxed = mount(RangesView, { props: { ...props, isShowRangeAdjust: true, params: { ...props.params, isShowMaxRange: true }, view: 'periods' } })
    expect(labels(maxed)).toEqual(['Day', 'Week', 'Month', 'Year'])
  })
})
