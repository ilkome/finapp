import localforage from 'localforage'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import {
  blockPersist,
  createDebouncedPersist,
  isPersistBlocked,
  showErrorToast,
  unblockPersist,
} from '~/composables/useStoreSync'
import { toastAddMock } from '~/test-utils/setup-store'

vi.mock('localforage', () => ({ default: { setItem: vi.fn() } }))

const setItem = vi.mocked(localforage.setItem)

describe('createDebouncedPersist', () => {
  beforeEach(() => {
    vi.useFakeTimers()
    setItem.mockClear()
    unblockPersist()
  })
  afterEach(() => {
    vi.useRealTimers()
    unblockPersist()
  })

  it('debounces and writes the latest value to localforage', () => {
    const persist = createDebouncedPersist<{ n: number }>('finapp.test')
    persist({ n: 1 })
    persist({ n: 2 })
    expect(setItem).not.toHaveBeenCalled() // still within the debounce window

    vi.advanceTimersByTime(300)
    expect(setItem).toHaveBeenCalledTimes(1)
    expect(setItem).toHaveBeenCalledWith('finapp.test', { n: 2 })
  })

  it('skips the write while persistence is blocked (sign-out cleanup)', () => {
    blockPersist()
    expect(isPersistBlocked()).toBe(true)

    const persist = createDebouncedPersist<number>('finapp.test')
    persist(1)
    vi.advanceTimersByTime(300)

    expect(setItem).not.toHaveBeenCalled()
  })
})

describe('showErrorToast', () => {
  beforeEach(() => {
    toastAddMock.mockClear()
  })

  it('adds an error toast carrying the (translated) i18n key', () => {
    showErrorToast('sync.errors.uploadRejected')

    expect(toastAddMock).toHaveBeenCalledTimes(1)
    expect(toastAddMock).toHaveBeenCalledWith(
      expect.objectContaining({ color: 'error', description: 'sync.errors.uploadRejected' }),
    )
  })
})
