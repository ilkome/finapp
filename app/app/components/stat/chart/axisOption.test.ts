import { describe, expect, it } from 'vitest'

import { buildAxisChartOption } from '~/components/stat/chart/axisOption'
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
})
