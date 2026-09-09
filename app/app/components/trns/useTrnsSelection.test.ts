import { describe, expect, it } from 'vitest'

import { useTrnsSelection } from '~/components/trns/useTrnsSelection'

describe('useTrnsSelection', () => {
  it('toggles ids on and off and clears the whole selection', () => {
    const selection = useTrnsSelection()

    selection.toggle('a')
    selection.toggle('b')
    expect(selection.ids.value).toEqual(['a', 'b'])
    expect(selection.count.value).toBe(2)
    expect(selection.has('a')).toBe(true)

    selection.toggle('a')
    expect(selection.ids.value).toEqual(['b'])
    expect(selection.has('a')).toBe(false)

    selection.clear()
    expect(selection.ids.value).toEqual([])
    expect(selection.count.value).toBe(0)
  })
})
