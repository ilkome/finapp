import { describe, expect, it } from 'vitest'

import { toCsv } from '~/components/wallets/analytics/export'

describe('toCsv', () => {
  it('writes a header and a row per point, quoting where needed', () => {
    expect(toCsv(['Jan', 'Feb'], [{ data: [1.5, Number.NaN], name: 'Cash, RUB' }])).toBe(',"Cash, RUB"\nJan,1.5\nFeb,')
  })
})
