import { describe, expect, it } from 'vitest'

import { userSettingsSchema } from './types'

describe('userSettingsSchema', () => {
  it('backfills paymentReminders for a payload saved before the field existed', () => {
    expect(userSettingsSchema.parse({ baseCurrency: 'RUB', locale: 'ru' }).paymentReminders).toBe(true)
  })

  it('keeps an explicit opt-out', () => {
    expect(userSettingsSchema.parse({ baseCurrency: 'RUB', paymentReminders: false }).paymentReminders).toBe(false)
  })
})
