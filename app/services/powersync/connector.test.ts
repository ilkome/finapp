import type { SupabaseClient } from '@supabase/supabase-js'

import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { prepareUploadData, SupabaseConnector } from '~~/services/powersync/connector'
import { setUploadErrorHandler } from '~~/services/powersync/uploadErrorHandler'

vi.mock('@powersync/web', () => ({
  UpdateType: { DELETE: 'DELETE', PATCH: 'PATCH', PUT: 'PUT' },
}))

function makeClient(result: { error: unknown }): SupabaseClient {
  const resolve = () => Promise.resolve(result)
  const builder = {
    delete: () => ({ eq: resolve, in: resolve }),
    update: () => ({ eq: resolve }),
    upsert: resolve,
  }
  return { from: () => builder } as unknown as SupabaseClient
}

// Returns the given results in order, one per applied op (each PUT/PATCH/DELETE
// consumes one result), so multi-op transactions can fail on a specific op.
function makeClientSeq(results: { error: unknown }[]): SupabaseClient {
  let i = 0
  const next = () => Promise.resolve(results[i++] ?? { error: null })
  const builder = {
    delete: () => ({ eq: next, in: next }),
    update: () => ({ eq: next }),
    upsert: next,
  }
  return { from: () => builder } as unknown as SupabaseClient
}

function makeDb(crud: unknown[]) {
  const complete = vi.fn(async () => {})
  const database = {
    getNextCrudTransaction: vi.fn(async () => (crud.length ? { complete, crud } : null)),
  }
  return { complete, database: database as any }
}

const putOp = { id: 'trn1', op: 'PUT', opData: { amount: 1 }, table: 'trns' }

describe('uploadData', () => {
  beforeEach(() => {
    setUploadErrorHandler(null)
    vi.spyOn(console, 'error').mockImplementation(() => {})
  })
  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('completes the transaction on success without calling the error handler', async () => {
    const onError = vi.fn()
    setUploadErrorHandler(onError)
    const { complete, database } = makeDb([putOp])
    const connector = new SupabaseConnector(makeClient({ error: null }), 'http://ps')

    await connector.uploadData(database)

    expect(complete).toHaveBeenCalledTimes(1)
    expect(onError).not.toHaveBeenCalled()
  })

  it('discards a fatal error (RLS), completing the transaction and surfacing it', async () => {
    const onError = vi.fn()
    setUploadErrorHandler(onError)
    const { complete, database } = makeDb([putOp])
    const connector = new SupabaseConnector(
      makeClient({ error: { code: '42501', message: 'rls' } }),
      'http://ps',
    )

    await connector.uploadData(database)

    expect(complete).toHaveBeenCalledTimes(1) // discarded, queue not blocked
    expect(onError).toHaveBeenCalledTimes(1)
    expect(onError.mock.calls[0]?.[1]).toEqual([putOp]) // diverged ops
  })

  it('discards a permanent PostgREST request error (PGRST2xx) instead of blocking the queue', async () => {
    const onError = vi.fn()
    setUploadErrorHandler(onError)
    const { complete, database } = makeDb([putOp])
    const connector = new SupabaseConnector(
      makeClient({ error: { code: 'PGRST205', message: 'table not in schema cache' } }),
      'http://ps',
    )

    await connector.uploadData(database)

    expect(complete).toHaveBeenCalledTimes(1)
    expect(onError).toHaveBeenCalledTimes(1)
  })

  it('keeps a JWT error (PGRST3xx) retryable', async () => {
    const { complete, database } = makeDb([putOp])
    const connector = new SupabaseConnector(
      makeClient({ error: { code: 'PGRST301', message: 'jwt expired' } }),
      'http://ps',
    )

    await expect(connector.uploadData(database)).rejects.toMatchObject({ code: 'PGRST301' })
    expect(complete).not.toHaveBeenCalled()
  })

  it('surfaces only the failing op and those after it (slice from failedIndex)', async () => {
    const onError = vi.fn()
    setUploadErrorHandler(onError)
    const patchOp = { id: 'trn2', op: 'PATCH', opData: { amount: 2 }, table: 'trns' }
    const { complete, database } = makeDb([putOp, patchOp])
    // First op (PUT) succeeds and commits to the server; second op (PATCH) fails.
    const connector = new SupabaseConnector(
      makeClientSeq([{ error: null }, { error: { code: '23514', message: 'check' } }]),
      'http://ps',
    )

    await connector.uploadData(database)

    expect(complete).toHaveBeenCalledTimes(1)
    expect(onError).toHaveBeenCalledTimes(1)
    // The already-committed PUT is excluded; only the failing PATCH diverges.
    expect(onError.mock.calls[0]?.[1]).toEqual([patchOp])
  })

  it('sends consecutive PUTs and DELETEs on one table as one request each', async () => {
    const upsert = vi.fn(async () => ({ error: null }))
    const inFn = vi.fn(async () => ({ error: null }))
    const client = { from: () => ({ delete: () => ({ in: inFn }), upsert }) } as unknown as SupabaseClient
    const { complete, database } = makeDb([
      putOp,
      { id: 'trn2', op: 'PUT', opData: { amount: 2 }, table: 'trns' },
      { id: 'trn3', op: 'DELETE', table: 'trns' },
      { id: 'trn4', op: 'DELETE', table: 'trns' },
    ])

    await new SupabaseConnector(client, 'http://ps').uploadData(database)

    expect(upsert).toHaveBeenCalledTimes(1)
    expect(upsert).toHaveBeenCalledWith([{ amount: 1, id: 'trn1' }, { amount: 2, id: 'trn2' }])
    expect(inFn).toHaveBeenCalledWith('id', ['trn3', 'trn4'])
    expect(complete).toHaveBeenCalledTimes(1)
  })

  it('rethrows a retryable error without completing or surfacing', async () => {
    const onError = vi.fn()
    setUploadErrorHandler(onError)
    const { complete, database } = makeDb([putOp])
    const connector = new SupabaseConnector(
      makeClient({ error: { code: '08006', message: 'connection failure' } }),
      'http://ps',
    )

    await expect(connector.uploadData(database)).rejects.toBeDefined()

    expect(complete).not.toHaveBeenCalled() // PowerSync will retry
    expect(onError).not.toHaveBeenCalled()
  })

  it('is a no-op when there is no pending transaction', async () => {
    const { database } = makeDb([])
    const connector = new SupabaseConnector(makeClient({ error: null }), 'http://ps')
    await expect(connector.uploadData(database)).resolves.toBeUndefined()
  })
})

describe('prepareUploadData', () => {
  it('decodes JSON columns of the column map for Postgres jsonb', () => {
    expect(prepareUploadData('stat_views', {
      auto_rule: '{"operator":"and","conditions":[]}',
      config: '{"wallets":{"isShow":true}}',
      name: 'Classic',
    })).toEqual({
      auto_rule: { conditions: [], operator: 'and' },
      config: { wallets: { isShow: true } },
      name: 'Classic',
    })
  })

  it('keeps nullable JSON and tables without JSON columns unchanged', () => {
    expect(prepareUploadData('stat_views', { auto_rule: null })).toEqual({ auto_rule: null })
    const row = { config: '{"value":1}' }
    expect(prepareUploadData('wallets', row)).toBe(row)
  })
})
