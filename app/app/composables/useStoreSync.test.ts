import localforage from 'localforage'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import {
  blockPersist,
  createDebouncedPersist,
  initializeStoreSyncToast,
  isPersistBlocked,
  persistOptimistic,
  showErrorToast,
  unblockPersist,
} from '~/composables/useStoreSync'
import { toastAddMock } from '~/test-utils/setup-store'

const setItem = vi.mocked(localforage.setItem)

describe('createDebouncedPersist', () => {
  beforeEach(() => {
    unblockPersist()
  })
  afterEach(() => {
    unblockPersist()
  })

  it('buffers and writes the latest value to localforage', () => {
    const persist = createDebouncedPersist<{ n: number }>('finapp.test')
    persist({ n: 1 })
    persist({ n: 2 })
    expect(setItem).not.toHaveBeenCalled() // still within the debounce window

    persist.flush()
    expect(setItem).toHaveBeenCalledTimes(1)
    expect(setItem).toHaveBeenCalledWith('finapp.test', { n: 2 })
    persist.cancel()
  })

  it('skips the write while persistence is blocked (sign-out cleanup)', () => {
    blockPersist()
    expect(isPersistBlocked()).toBe(true)

    const persist = createDebouncedPersist<number>('finapp.test')
    persist(1)
    persist.flush()

    expect(setItem).not.toHaveBeenCalled()
    persist.cancel()
  })
})

describe('showErrorToast', () => {
  beforeEach(() => {
    initializeStoreSyncToast({ add: toastAddMock } as unknown as ReturnType<typeof useToast>)
  })

  it('adds an error toast carrying the (translated) i18n key', () => {
    showErrorToast('sync.errors.uploadRejected')

    expect(toastAddMock).toHaveBeenCalledTimes(1)
    expect(toastAddMock).toHaveBeenCalledWith(
      expect.objectContaining({ color: 'error', description: 'sync.errors.uploadRejected' }),
    )
  })
})

describe('persistOptimistic', () => {
  beforeEach(() => {
    initializeStoreSyncToast({ add: toastAddMock } as unknown as ReturnType<typeof useToast>)
  })

  it('returns true and skips rollback on success', async () => {
    const rollback = vi.fn()
    const logger = { error: vi.fn() }
    expect(await persistOptimistic(Promise.resolve(), { errorKey: 'k', label: 'save', logger, rollback })).toBe(true)
    expect(rollback).not.toHaveBeenCalled()
  })

  it('rolls back, logs and toasts on failure', async () => {
    const rollback = vi.fn()
    const logger = { error: vi.fn() }
    const err = new Error('boom')
    expect(await persistOptimistic(Promise.reject(err), { errorKey: 'x.failed', label: 'save', logger, rollback })).toBe(false)
    expect(rollback).toHaveBeenCalledTimes(1)
    expect(logger.error).toHaveBeenCalledWith('save failed', err)
    expect(toastAddMock).toHaveBeenCalledWith(expect.objectContaining({ color: 'error', description: 'x.failed' }))
  })
})
