import { describe, expect, it } from 'vitest'

import { buildAxisChartOption } from '~/components/stat/chart/axisOption'
import { resolveCssValues } from '~/components/stat/chart/cssValues'
import rawChartFixture from '~/components/stat/fixtures/chart.json'

type Options = Parameters<typeof buildAxisChartOption>[0]

const chartFixture = rawChartFixture as unknown as Options

function buildOption(overrides: Partial<Options> = {}) {
  return buildAxisChartOption({
    ...chartFixture,
    locale: 'en',
    viewportWidth: 1024,
    ...overrides,
  })
}

describe('buildAxisChartOption', () => {
  it('keeps each chart its own y axis when two charts are built (split expense and income)', () => {
    const big = buildOption()
    const bigMax = (big.yAxis as { max: number }).max
    buildOption({ series: chartFixture.series.map(item => ({ ...item, data: item.data.map(() => 1) })) })
    expect((big.yAxis as { max: number }).max).toBe(bigMax)
  })

  it('renders one series per input plus the scale guide when isShowScale is on', () => {
    const option = buildOption()
    const series = option.series as unknown[]
    expect(series).toHaveLength(chartFixture.series.length + 1)
  })

  it('drops the scale guide when isShowScale is off', () => {
    const option = buildOption({ chartConfig: { ...chartFixture.chartConfig, isShowScale: false } })
    const series = option.series as unknown[]
    expect(series).toHaveLength(chartFixture.series.length)
  })

  it('disables data zoom when not pannable, spanning the full label range', () => {
    const option = buildOption()
    const dataZoom = (option.dataZoom as Array<Record<string, unknown>>)[0]!
    expect(dataZoom.disabled).toBe(true)
    expect(dataZoom.startValue).toBe(0)
    expect(dataZoom.endValue).toBe(chartFixture.xAxisLabels.length - 1)
  })

  it('enables data zoom to the given window when pannable', () => {
    const [start, , , end] = chartFixture.xAxisLabels
    const option = buildOption({ endValue: end, isPannable: true, startValue: start })
    const dataZoom = (option.dataZoom as Array<Record<string, unknown>>)[0]!
    expect(dataZoom.disabled).toBe(false)
    expect(dataZoom.startValue).toBe(0)
    expect(dataZoom.endValue).toBe(3)
  })

  it('gives the scale guide series a markLine built from the resolved scale', () => {
    const option = buildOption()
    const series = option.series as Array<{ markLine?: unknown, name?: string }>
    const guide = series.find(item => item.name === 'scale-guides')
    expect(guide?.markLine).toBeDefined()
  })

  it('hides the tooltip on phones unless it opens on tap', () => {
    expect((buildOption({ viewportWidth: 375 }).tooltip as { show: boolean }).show).toBe(false)
    const tap = buildOption({ isTooltipOnTap: true, viewportWidth: 375 }).tooltip as Record<string, unknown>
    expect(tap).toMatchObject({ enterable: true, show: true, triggerOn: 'click' })
    expect((buildOption({ isTooltipOnTap: true }).tooltip as Record<string, unknown>).triggerOn).toBe('mousemove|click')
  })

  it('paints the selected period with its resolved color: the canvas cannot read a CSS variable', () => {
    const key = `${chartFixture.xAxisLabels[1]}`
    const marked = { data: [], markArea: { data: [[{ xAxis: key }, { xAxis: key }]] }, markedArea: 'markedArea', name: '', type: 'line' }
    const option = resolveCssValues(buildOption({ series: [...chartFixture.series, marked] as Options['series'] }), () => 'rgb(1,2,3)')
    const active = (option.series as Array<{ itemStyle?: { color: string }, name?: string, renderItem?: (...args: any[]) => { style: { fill: string } } }>)
      .find(item => item.name === 'active-period')!
    expect(active.itemStyle?.color).toBe('rgb(1,2,3)')
    const shape = active.renderItem!({ coordSys: { height: 100, y: 0 } }, {
      coord: ([index]: number[]) => [index! * 10, 0],
      value: () => 1,
      visual: () => active.itemStyle!.color,
    })
    expect(shape.style.fill).toBe('rgb(1,2,3)')
  })
})
