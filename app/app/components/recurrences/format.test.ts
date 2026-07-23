import { describe, expect, it } from 'vitest'

import { recurrenceEveryLabel } from '~/components/recurrences/format'

// Stub translate: echoes the key so we assert which branch/keys were used.
const t = (key: string, choice?: number) => (choice === undefined ? key : `${key}#${choice}`)

describe('recurrenceEveryLabel', () => {
  it('interval 1 uses the singular "everyOne" key', () => {
    expect(recurrenceEveryLabel(t, 'month', 1)).toBe('recurrences.everyOne.month')
  })

  it('interval > 1 builds "every N unit" with the pluralized unit', () => {
    expect(recurrenceEveryLabel(t, 'month', 3)).toBe('recurrences.form.every 3 recurrences.unit.month#3')
  })
})
