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

  it('selects a whole group, then deselects it once every id is selected', () => {
    const selection = useTrnsSelection()

    selection.toggle('a')
    selection.toggleMany(['a', 'b'])
    expect(selection.ids.value).toEqual(['a', 'b'])

    selection.toggleMany(['a', 'b'])
    expect(selection.ids.value).toEqual([])
  })
})
