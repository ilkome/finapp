import { describe, expect, it } from 'vitest'

import { defaultConfig } from './schema'
import { normalizeStoredStatConfig } from './useStatConfig'

describe('normalizeStoredStatConfig', () => {
  it('maps legacy pie chart configs to bar', () => {
    const config = normalizeStoredStatConfig({ chart: { type: 'pie' } }, structuredClone(defaultConfig))

    expect(config.chart.type).toBe('bar')
  })
})
