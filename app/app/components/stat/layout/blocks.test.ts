import { describe, expect, it } from 'vitest'

import { defaultConfig } from '~/components/stat/config/schema'
import { resolveStatLayoutBlocks } from '~/components/stat/layout/blocks'

function resolve(overrides: Partial<Parameters<typeof resolveStatLayoutBlocks>[0]> = {}, patch: (config: typeof defaultConfig) => void = () => {}) {
  const config = structuredClone(defaultConfig)
  patch(config)
  return resolveStatLayoutBlocks({ config, contextBlockIds: [], hasWalletFilter: false, ...overrides })
}

describe('resolveStatLayoutBlocks', () => {
  it('drops context blocks the page does not provide and hidden panels', () => {
    const { orderedBlocks } = resolve({ contextBlockIds: ['walletBalance'], hiddenPanels: ['chart'] })
    expect(orderedBlocks).not.toContain('categoryChildren')
    expect(orderedBlocks).toContain('walletBalance')
    expect(orderedBlocks).not.toContain('chart')
  })

  it('navigation and summary follow their isShow flags', () => {
    const { orderedBlocks } = resolve({}, (config) => {
      config.date.isShow = false
      config.summary.isShow = false
    })
    expect(orderedBlocks).not.toContain('navigation')
    expect(orderedBlocks).not.toContain('summary')
  })

  it('renders wallets only when offered and no wallet filter is active', () => {
    const show = (config: typeof defaultConfig) => {
      config.wallets.isShow = true
    }
    expect(resolve({ showWallets: true }, show).renderedBlocks).toContain('wallets')
    expect(resolve({ hasWalletFilter: true, showWallets: true }, show).renderedBlocks).not.toContain('wallets')
    expect(resolve({}, show).renderedBlocks).not.toContain('wallets')
    // ordered keeps it so the slot order is stable while it is hidden
    expect(resolve({}, show).orderedBlocks).toContain('wallets')
  })

  it('folds consecutive report blocks into one entry and keeps trns last for history', () => {
    const { entries, renderedBlocks } = resolve()
    const report = entries.find(entry => entry.blocks)
    expect(report?.blocks).toEqual(['vertical', 'catsRound', 'catsList', 'trns'])
    expect(entries.filter(entry => entry.blocks)).toHaveLength(1)
    expect(renderedBlocks.at(-1)).toBe('trns')
  })
})
