import { readFileSync } from 'node:fs'
import { describe, expect, it } from 'vitest'
import { AppSchema } from '~~/services/powersync/AppSchema'
import { SYNCED_TABLES } from '~~/services/powersync/tables'

describe('sYNCED_TABLES', () => {
  it('matches every AppSchema table except the global exchange rates', () => {
    const schema = AppSchema.tables.map(t => t.name).filter(n => n !== 'exchange_rates').sort()
    expect(schema).toEqual([...SYNCED_TABLES].sort())
  })

  it('matches the backup script table list', () => {
    const src = readFileSync(new URL('../../scripts/backup-finapp.mjs', import.meta.url), 'utf8')
    const list = src.match(/const USER_TABLES = \[([^\]]+)\]/)![1]!.match(/'([^']+)'/g)!.map(s => s.slice(1, -1))
    expect(list.sort()).toEqual([...SYNCED_TABLES].sort())
  })
})
