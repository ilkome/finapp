import { describe, expect, it } from 'vitest'

import { parseStatBlockPayload } from '~/components/stat/blocks/payload'
import line from '~/components/stat/fixtures/categoryLine.json'
import list from '~/components/stat/fixtures/categoryList.json'
import chart from '~/components/stat/fixtures/chart.json'
import chips from '~/components/stat/fixtures/chips.json'
import sums from '~/components/stat/fixtures/sums.json'
import trn from '~/components/stat/fixtures/trn.json'
import wallets from '~/components/stat/fixtures/wallets.json'

describe('stat block payloads', () => {
  it.each([
    ['sums', sums],
    ['chart', chart],
    ['wallets', wallets],
    ['chips', chips],
    ['trns', { rows: [trn] }],
    ['categoriesList', list],
    ['categoriesVertical', { currencyCode: 'USD', maxCategoryValues: list.maxCategoryValues, rows: list.rows }],
    ['categoriesRound', { currencyCode: 'USD', rows: [{ category: line.category, item: line.item }] }],
  ])('accepts the %s fixture', (type, props) => {
    const result = parseStatBlockPayload({ props, type })
    expect(result.success, JSON.stringify(result.success ? null : result.error.issues)).toBe(true)
  })

  it('rejects an unknown block and a broken sums payload', () => {
    expect(parseStatBlockPayload({ props: {}, type: 'nope' }).success).toBe(false)
    expect(parseStatBlockPayload({ props: { currencyCode: 'USD', items: [{ amount: 'x', type: 'expense' }] }, type: 'sums' }).success).toBe(false)
  })
})
