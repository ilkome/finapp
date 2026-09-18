import type { ComputedRef, Ref } from 'vue'

import type { StatConfigBlockId } from '~/components/stat/config/schema'
import type { StatConfigProvider } from '~/components/stat/config/types'

type Params = {
  hostStickyNavigation: boolean
  orderedBlocks: ComputedRef<StatConfigBlockId[]>
  statConfig: StatConfigProvider
  stickyTop: Ref<number>
}

/**
 * Navigation and summary can both stick; whichever comes second is offset by the
 * measured height of the first so they stack instead of overlapping.
 */
export function useStatPinnedOffsets({ hostStickyNavigation, orderedBlocks, statConfig, stickyTop }: Params) {
  const statNavigation = shallowRef<HTMLElement>()
  const statSummary = shallowRef<HTMLElement>()
  const { height: measuredNavigationHeight } = useElementSize(statNavigation, undefined, { box: 'border-box' })
  const { height: measuredSummaryHeight } = useElementSize(statSummary, undefined, { box: 'border-box' })
  const stickyNavigationHeight = computed(() => Math.max(42, measuredNavigationHeight.value))

  const navigationIsPinned = computed(() => hostStickyNavigation && statConfig.config.value.date.isPinned)
  const summaryIsPinned = computed(() => hostStickyNavigation && statConfig.config.value.summary.isPinned)
  const bothPinned = computed(() => navigationIsPinned.value && summaryIsPinned.value)
  const navigationIndex = computed(() => orderedBlocks.value.indexOf('navigation'))
  const summaryIndex = computed(() => orderedBlocks.value.indexOf('summary'))
  const navigationStickyTop = computed(() => stickyTop.value + (
    bothPinned.value && summaryIndex.value < navigationIndex.value
      ? measuredSummaryHeight.value
      : 0
  ))
  const summaryStickyTop = computed(() => stickyTop.value + (
    bothPinned.value && navigationIndex.value < summaryIndex.value
      ? stickyNavigationHeight.value
      : 0
  ))

  function setNavigationElement(element: unknown) {
    statNavigation.value = element instanceof HTMLElement ? element : undefined
  }

  function setSummaryElement(element: unknown) {
    statSummary.value = element instanceof HTMLElement ? element : undefined
  }

  return { navigationIsPinned, navigationStickyTop, setNavigationElement, setSummaryElement, summaryIsPinned, summaryStickyTop }
}
