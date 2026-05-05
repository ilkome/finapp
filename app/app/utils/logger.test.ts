import { afterEach, describe, expect, it, vi } from 'vitest'

import { createLogger } from '~/utils/logger'

describe('createLogger', () => {
  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('error() calls console.error with prefix', () => {
    const spy = vi.spyOn(console, 'error').mockImplementation(() => {})

    createLogger('pfx').error('msg', 42)

    expect(spy).toHaveBeenCalledWith('[pfx]', 'msg', 42)
  })

  it('log() calls console.log with prefix in dev mode', () => {
    const spy = vi.spyOn(console, 'log').mockImplementation(() => {})

    createLogger('pfx', true).log('info')

    expect(spy).toHaveBeenCalledWith('[pfx]', 'info')
  })

  it('log() is no-op in production', () => {
    const spy = vi.spyOn(console, 'log').mockImplementation(() => {})

    createLogger('pfx', false).log('should not appear')

    expect(spy).not.toHaveBeenCalled()
  })
})
