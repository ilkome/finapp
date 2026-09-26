import type { MiniItemConfig, StatConfigBlockId, StatContextBlockId, StatReportBlockId } from '~/components/stat/config/schema'
import type { StatBlockPanelId } from '~/components/stat/views/types'

import { PANELS } from '~/components/stat/config/panels/registry'
import { statContextBlockIds, statReportBlockOrder } from '~/components/stat/config/schema'

export type StatLayoutEntry = {
  block?: StatConfigBlockId
  blocks?: StatReportBlockId[]
  key: string
}

type Params = {
  config: MiniItemConfig
  contextBlockIds: readonly StatContextBlockId[]
  hasWalletFilter: boolean
  hiddenPanels?: StatBlockPanelId[]
  showWallets?: boolean
}

function isContextBlock(block: StatConfigBlockId): block is StatContextBlockId {
  return (statContextBlockIds as readonly string[]).includes(block)
}

function isReportBlock(block: StatConfigBlockId): block is StatReportBlockId {
  return statReportBlockOrder.includes(block as StatReportBlockId)
}

/**
 * `orderedBlocks` is what the layout iterates (consecutive report blocks fold into one entry so
 * they share a section); `renderedBlocks` is the subset that actually shows, which decides
 * whether history can follow the last block.
 */
export function resolveStatLayoutBlocks({ config, contextBlockIds, hasWalletFilter, hiddenPanels, showWallets }: Params) {
  const hidden = new Set<string>(hiddenPanels ?? [])
  const available = new Set<StatContextBlockId>(contextBlockIds)

  const orderedBlocks = config.page.blockOrder.filter((block) => {
    if (hidden.has(block))
      return false
    if (isContextBlock(block))
      return available.has(block) && PANELS[block].getIsShow(config)
    if (block === 'navigation')
      return config.date.isShow
    if (block === 'summary')
      return config.summary.isShow
    return true
  })

  const renderedBlocks = orderedBlocks.filter((block) => {
    if (block === 'wallets')
      return !!showWallets && !hasWalletFilter && PANELS.wallets.getIsShow(config)
    return PANELS[block].getIsShow(config)
  })

  const entries: StatLayoutEntry[] = []
  for (const block of orderedBlocks) {
    const previous = entries.at(-1)
    if (isReportBlock(block) && previous?.blocks)
      previous.blocks.push(block)
    else if (isReportBlock(block))
      entries.push({ blocks: [block], key: `report-${entries.length}` })
    else
      entries.push({ block, key: block })
  }

  return { entries, orderedBlocks, renderedBlocks }
}
