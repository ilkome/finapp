import { describe, expect, it } from 'vitest'

import { getSafeRedirectPath } from '~/utils/redirect'

describe('getSafeRedirectPath', () => {
  it('allows relative paths', () => {
    expect(getSafeRedirectPath('/dashboard')).toBe('/dashboard')
    expect(getSafeRedirectPath('/settings/profile')).toBe('/settings/profile')
  })

  it('blocks protocol-relative URLs (open redirect vector)', () => {
    expect(getSafeRedirectPath('//evil.com')).toBe('/dashboard')
    expect(getSafeRedirectPath('//evil.com/phish')).toBe('/dashboard')
  })

  it('blocks absolute URLs', () => {
    expect(getSafeRedirectPath('https://evil.com')).toBe('/dashboard')
    expect(getSafeRedirectPath('http://evil.com')).toBe('/dashboard')
  })

  it('blocks non-string values', () => {
    expect(getSafeRedirectPath(null)).toBe('/dashboard')
    expect(getSafeRedirectPath(undefined)).toBe('/dashboard')
    expect(getSafeRedirectPath(123)).toBe('/dashboard')
  })

  it('blocks empty string', () => {
    expect(getSafeRedirectPath('')).toBe('/dashboard')
  })
})
