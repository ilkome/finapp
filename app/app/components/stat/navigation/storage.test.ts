import { describe, expect, it } from 'vitest'
import { reactive } from 'vue'

import { defaultConfig } from '~/components/stat/config/schema'
import { defaultStatDateParams } from '~/components/stat/date/params'
import { getStatNavigationSnapshot, getStatSnapshotQueryId, saveStatNavigationSnapshot } from '~/components/stat/navigation/storage'

class MemoryStorage implements Storage {
  protected readonly values = new Map<string, string>()

  get length() { return this.values.size }
  clear() { this.values.clear() }
  getItem(key: string) { return this.values.get(key) ?? null }
  key(index: number) { return [...this.values.keys()][index] ?? null }
  removeItem(key: string) { this.values.delete(key) }
  setItem(key: string, value: string) { this.values.set(key, value) }
}

class FailingStorage extends MemoryStorage {
  override setItem() {
    throw new DOMException('Storage is unavailable', 'QuotaExceededError')
  }
}

function snapshot() {
  return {
    config: structuredClone(defaultConfig),
    date: structuredClone(defaultStatDateParams),
    filteredType: 'expense' as const,
    reportType: 'combined' as const,
    trns: {
      filterBy: 'expense' as const,
      isShowWithDesc: true,
    },
  }
}

describe('statistics navigation snapshot storage', () => {
  it('stores and returns an independent validated copy', () => {
    const storage = new MemoryStorage()
    const source = reactive(snapshot())
    const id = saveStatNavigationSnapshot(source, { id: 'entry', now: 100, storage })

    source.config.chart.isShow = false
    source.date.rangeOffset = 5

    expect(id).toBe('entry')
    expect(getStatNavigationSnapshot(id, { now: 100, storage })).toMatchObject({
      config: { chart: { isShow: true } },
      date: { rangeOffset: 0 },
      filteredType: 'expense',
      reportType: 'combined',
      trns: { filterBy: 'expense', isShowWithDesc: true },
      version: 2,
    })
  })

  it('rejects missing and malformed entries', () => {
    const storage = new MemoryStorage()
    storage.setItem('finapp.statNavigation.broken', '{')
    storage.setItem('finapp.statNavigation.index', JSON.stringify([{ createdAt: 100, id: 'broken' }]))

    expect(getStatNavigationSnapshot('missing', { storage })).toBeNull()
    expect(getStatNavigationSnapshot('broken', { storage })).toBeNull()
    expect(storage.getItem('finapp.statNavigation.broken')).toBeNull()
    expect(storage.getItem('finapp.statNavigation.index')).toBe('[]')
  })

  it('removes an expired entry when reading it', () => {
    const storage = new MemoryStorage()
    saveStatNavigationSnapshot(snapshot(), { id: 'expired', now: 100, storage })

    expect(getStatNavigationSnapshot('expired', { now: 24 * 60 * 60 * 1000 + 101, storage })).toBeNull()
    expect(storage.getItem('finapp.statNavigation.expired')).toBeNull()
  })

  it('keeps only the ten newest entries', () => {
    const storage = new MemoryStorage()
    for (let index = 0; index < 12; index++)
      saveStatNavigationSnapshot(snapshot(), { id: `entry-${index}`, now: 100 + index, storage })

    expect(storage.getItem('finapp.statNavigation.entry-0')).toBeNull()
    expect(storage.getItem('finapp.statNavigation.entry-1')).toBeNull()
    expect(storage.getItem('finapp.statNavigation.entry-2')).not.toBeNull()
    expect(storage.length).toBe(11)
  })

  it('fails closed when storage is unavailable', () => {
    expect(saveStatNavigationSnapshot(snapshot(), { storage: new FailingStorage() })).toBeNull()
    expect(saveStatNavigationSnapshot(snapshot(), { storage: null })).toBeNull()
  })

  it('normalizes the query id', () => {
    expect(getStatSnapshotQueryId('entry')).toBe('entry')
    expect(getStatSnapshotQueryId(['entry'])).toBeNull()
    expect(getStatSnapshotQueryId('')).toBeNull()
  })
})
