import { describe, expect, it } from 'vitest'

import { snapRadius } from './themeCss'

describe('snapRadius', () => {
  it('maps radii from the older option list onto square or rounded', () => {
    expect([0, 0.25, 0.375, 0.5].map(snapRadius)).toEqual([0, 0.5, 0.5, 0.5])
  })
})
