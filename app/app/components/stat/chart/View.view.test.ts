import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'

import StatChartView from '~/components/stat/chart/View.vue'
import chart from '~/components/stat/fixtures/chart.json'

const stubs = {
  LazyStatChartAxisView: { props: ['series', 'chartType', 'chartConfig'], template: '<div data-axis :data-type="chartType">{{ series.length }}</div>' },
  LazyStatChartSimplePieView: { props: ['series'], template: '<div data-pie />' },
  StatChartIntervalSelect: { props: ['period'], template: '<button data-interval @click="$emit(\'changePeriod\', \'month\')">{{ period }}</button>' },
}

describe('statChartView', () => {
  it('renders the axis chart from plain JSON and forwards the period change', async () => {
    const wrapper = mount(StatChartView, { global: { stubs }, props: chart as any })
    await new Promise(resolve => setTimeout(resolve, 0))
    expect(wrapper.find('[data-interval]').text()).toBe('day')
    await wrapper.find('[data-interval]').trigger('click')
    expect(wrapper.emitted('changePeriod')).toEqual([['month']])
  })

  it('hides itself when the config says so', () => {
    const wrapper = mount(StatChartView, { global: { stubs }, props: { ...chart, chartConfig: { ...chart.chartConfig, isShow: false } } as any })
    expect(wrapper.html()).toBe('<!--v-if-->')
  })
})
