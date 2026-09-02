import { describe, expect, it } from 'vitest'

import { resolveStatConfigOverlayOpen } from './useStatConfigOverlay'

describe('resolveStatConfigOverlayOpen', () => {
  it('opens only the overlay owned by the active page', () => {
    expect(resolveStatConfigOverlayOpen('wallet', 'wallet')).toBe(true)
    expect(resolveStatConfigOverlayOpen('wallet', 'dashboard')).toBe(false)
  })

  it('exposes aggregate open state to the layout', () => {
    expect(resolveStatConfigOverlayOpen('wallet', null)).toBe(true)
    expect(resolveStatConfigOverlayOpen(null, null)).toBe(false)
  })
})
