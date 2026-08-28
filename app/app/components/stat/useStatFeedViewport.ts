import type { Virtualizer } from '@tanstack/vue-virtual'
import type { Ref, ShallowRef } from 'vue'

import type { StatReportContext } from '~/components/stat/report/types'
import type { StatFeedScope, StatPeriodTransitionState } from '~/components/stat/types'
import type { useStatInfinitePeriods } from '~/components/stat/useStatInfinitePeriods'

import {
  isSameStatFeedScope,
  normalizeStatFeedScope,
  resolveStatFeedScrollTop,
  resolveStatPeriodTransition,
  resolveStatStickyBottom,
} from '~/components/stat/statFeed'

export function useStatFeedViewport(params: {
  ctx: StatReportContext
  feedHeader: Readonly<ShallowRef<HTMLElement | null>>
  infinite: ReturnType<typeof useStatInfinitePeriods>
  isFillingViewport: ShallowRef<boolean>
  isReconciling: ShallowRef<boolean>
  preservedCategoryScrollTop: ShallowRef<number | null>
  scrollMargin: ShallowRef<number>
  stickyBottom: ShallowRef<number>
  stickyTop: Ref<number>
  transactionsCount: Readonly<Ref<number>>
  virtualizer: Readonly<Ref<Virtualizer<Window, Element>>>
  virtualViewport: Readonly<ShallowRef<HTMLElement | null>>
}) {
  const { scrollMargin, stickyBottom } = params
  const { isFillingViewport, isReconciling } = params
  const activePeriodTransitionCount = shallowRef(0)
  const activeListenerCount = shallowRef(0)
  const activeObserverCount = shallowRef(0)

  let activePeriodFrame: number | null = null
  let activePeriodScrollDirection: 'backward' | 'forward' | null = null
  let activePeriodInputDirection: 'backward' | 'forward' | null = null
  let activePeriodState: StatPeriodTransitionState = {
    activeOffset: params.ctx.params.statDate.scrollRangeOffset.value ?? params.ctx.params.statDate.params.value.rangeOffset,
    direction: null,
  }
  let lastPageScrollTop = 0
  let geometryFrame: number | null = null
  let resizeObserver: ResizeObserver | undefined
  let isResetQueued = false
  let isFillQueued = false
  let isScrollbarDragging = false
  let lastTouchY: number | null = null

  function getStickyBottom() {
    const summary = document.querySelector<HTMLElement>('[data-stat-sticky-summary]')
    if (!summary)
      return params.stickyTop.value
    const rect = summary.getBoundingClientRect()
    return resolveStatStickyBottom(params.stickyTop.value, rect.top, rect.bottom)
  }

  function updateGeometry() {
    geometryFrame = null
    const viewport = params.virtualViewport.value
    if (!viewport)
      return
    const nextScrollMargin = viewport.getBoundingClientRect().top + window.scrollY
    const nextStickyBottom = getStickyBottom()
    if (Math.abs(scrollMargin.value - nextScrollMargin) > 0.5)
      scrollMargin.value = nextScrollMargin
    if (Math.abs(stickyBottom.value - nextStickyBottom) > 0.5)
      stickyBottom.value = nextStickyBottom
  }

  function scheduleGeometryUpdate() {
    if (geometryFrame === null)
      geometryFrame = requestAnimationFrame(updateGeometry)
  }

  function updateActivePeriod() {
    activePeriodFrame = null
    const direction = activePeriodScrollDirection
    activePeriodScrollDirection = null
    if (!direction)
      return
    const currentOffset = params.ctx.params.statDate.scrollRangeOffset.value ?? params.ctx.params.statDate.params.value.rangeOffset
    if (activePeriodState.activeOffset !== currentOffset)
      activePeriodState = { activeOffset: currentOffset, direction: null }
    const transition = resolveStatPeriodTransition(activePeriodState, {
      direction,
      items: params.virtualizer.value.getVirtualItems(),
      rows: params.infinite.rows.value,
      source: 'scroll',
      visibleTop: (params.virtualizer.value.scrollOffset ?? window.scrollY) + stickyBottom.value,
    })
    activePeriodState = transition
    if (transition.activeOffset !== currentOffset) {
      activePeriodTransitionCount.value++
      params.infinite.setActiveOffset(transition.activeOffset)
    }
  }

  function scheduleActivePeriodUpdate() {
    if (activePeriodFrame === null)
      activePeriodFrame = requestAnimationFrame(updateActivePeriod)
  }

  function onPageScroll() {
    const scrollTop = document.scrollingElement?.scrollTop ?? window.scrollY
    const delta = scrollTop - lastPageScrollTop
    lastPageScrollTop = scrollTop
    if (Math.abs(delta) <= 0.5 || isReconciling.value)
      return
    const direction = activePeriodInputDirection ?? (isScrollbarDragging ? (delta > 0 ? 'forward' : 'backward') : null)
    if (!direction)
      return
    activePeriodScrollDirection = direction
    scheduleActivePeriodUpdate()
  }
  function onWheel(event: WheelEvent) {
    if (Math.abs(event.deltaY) > 0.5)
      activePeriodInputDirection = event.deltaY > 0 ? 'forward' : 'backward'
  }
  function onTouchStart(event: TouchEvent) {
    lastTouchY = event.touches[0]?.clientY ?? null
  }
  function onTouchMove(event: TouchEvent) {
    const nextTouchY = event.touches[0]?.clientY
    if (lastTouchY === null || nextTouchY === undefined)
      return
    const delta = lastTouchY - nextTouchY
    lastTouchY = nextTouchY
    if (Math.abs(delta) > 0.5)
      activePeriodInputDirection = delta > 0 ? 'forward' : 'backward'
  }
  function onTouchEnd() {
    lastTouchY = null
  }
  function onPointerDown(event: PointerEvent) {
    isScrollbarDragging = event.pointerType === 'mouse' && event.clientX >= document.documentElement.clientWidth - 24
  }
  function onPointerUp() {
    isScrollbarDragging = false
  }
  function onScrollKeyDown(event: KeyboardEvent) {
    const target = event.target
    if (event.defaultPrevented || (target instanceof HTMLElement && (target.isContentEditable || ['INPUT', 'SELECT', 'TEXTAREA'].includes(target.tagName))))
      return
    if (['ArrowDown', 'End', 'PageDown'].includes(event.key) || (event.key === ' ' && !event.shiftKey))
      activePeriodInputDirection = 'forward'
    else if (['ArrowUp', 'Home', 'PageUp'].includes(event.key) || (event.key === ' ' && event.shiftKey))
      activePeriodInputDirection = 'backward'
  }
  function onPageScrollEnd() {
    activePeriodInputDirection = null
    activePeriodState = {
      activeOffset: params.ctx.params.statDate.scrollRangeOffset.value ?? params.ctx.params.statDate.params.value.rangeOffset,
      direction: null,
    }
  }

  function nextAnimationFrame() {
    return new Promise<void>(resolve => requestAnimationFrame(() => resolve()))
  }
  async function settleVirtualMeasurements() {
    await nextTick()
    await nextAnimationFrame()
    await nextAnimationFrame()
  }
  async function fillViewport() {
    if (isFillingViewport.value) {
      isFillQueued = true
      return
    }
    isFillingViewport.value = true
    let appendedPeriods = 0
    try {
      while (params.infinite.canLoadMore.value) {
        await settleVirtualMeasurements()
        const viewport = params.virtualViewport.value
        if (!viewport)
          break
        if (params.transactionsCount.value > 0 && viewport.getBoundingClientRect().bottom > window.innerHeight + 2)
          break
        const result = params.infinite.loadMore('initial-fill')
        if (result.status !== 'appended')
          break
        appendedPeriods++
        if (import.meta.dev && appendedPeriods > 500)
          throw new Error('Statistics feed viewport fill exceeded 500 appended periods')
      }
    }
    finally {
      isFillingViewport.value = false
      scheduleGeometryUpdate()
      if (isFillQueued) {
        isFillQueued = false
        void fillViewport()
      }
    }
  }

  watch(
    params.infinite.localFilterGeneration,
    () => void nextTick(fillViewport),
  )

  const listeners = [
    ['keydown', onScrollKeyDown],
    ['pointercancel', onPointerUp],
    ['pointerdown', onPointerDown],
    ['pointerup', onPointerUp],
    ['scroll', onPageScroll],
    ['scrollend', onPageScrollEnd],
    ['touchend', onTouchEnd],
    ['touchmove', onTouchMove],
    ['touchstart', onTouchStart],
    ['wheel', onWheel],
    ['resize', scheduleGeometryUpdate],
  ] as const

  function observeGeometry() {
    if (resizeObserver)
      return
    resizeObserver = new ResizeObserver(scheduleGeometryUpdate)
    if (params.feedHeader.value) {
      resizeObserver.observe(params.feedHeader.value)
      activeObserverCount.value++
    }
    const summary = document.querySelector<HTMLElement>('[data-stat-sticky-summary]')
    if (summary) {
      resizeObserver.observe(summary)
      activeObserverCount.value++
    }
    lastPageScrollTop = document.scrollingElement?.scrollTop ?? window.scrollY
    for (const [name, listener] of listeners) {
      window.addEventListener(name, listener as EventListener, {
        passive: true,
      })
    }
    activeListenerCount.value = listeners.length
  }
  function stopObservingGeometry() {
    resizeObserver?.disconnect()
    resizeObserver = undefined
    for (const [name, listener] of listeners) window.removeEventListener(name, listener as EventListener)
    activeListenerCount.value = 0
    activeObserverCount.value = 0
    if (activePeriodFrame !== null)
      cancelAnimationFrame(activePeriodFrame)
    if (geometryFrame !== null)
      cancelAnimationFrame(geometryFrame)
    activePeriodFrame = null
    geometryFrame = null
  }

  async function resetFeed() {
    if (isReconciling.value) {
      isResetQueued = true
      return
    }
    isReconciling.value = true
    const scroller = document.scrollingElement
    const landingScrollTop = resolveStatFeedScrollTop(params.preservedCategoryScrollTop.value, scroller?.scrollTop ?? 0, false) ?? 0
    try {
      activePeriodScrollDirection = null
      activePeriodInputDirection = null
      isScrollbarDragging = false
      activePeriodTransitionCount.value = 0
      params.infinite.reset()
      activePeriodState = {
        activeOffset: params.ctx.params.statDate.params.value.rangeOffset,
        direction: null,
      }
      await nextTick()
      updateGeometry()
      if (scroller && Math.abs(scroller.scrollTop - landingScrollTop) > 0.5)
        window.scrollTo({ top: landingScrollTop })
      await fillViewport()
      await settleVirtualMeasurements()
    }
    finally {
      isReconciling.value = false
      if (isResetQueued) {
        isResetQueued = false
        void resetFeed()
      }
    }
  }

  const reportScope = computed<StatFeedScope>(() => ({
    childCategoryId: params.ctx.filteredChildCategoryId.value,
    date: {
      customDate: params.ctx.params.statDate.params.value.customDate,
      granularityBy: params.ctx.params.statDate.params.value.granularityBy,
      granularityDuration: params.ctx.params.statDate.params.value.granularityDuration,
      isShowMaxRange: params.ctx.params.statDate.params.value.isShowMaxRange,
      isSkipEmpty: params.ctx.params.statDate.params.value.isSkipEmpty,
      rangeBy: params.ctx.params.statDate.params.value.rangeBy,
      rangeDuration: params.ctx.params.statDate.params.value.rangeDuration,
      rangeOffset: params.ctx.params.statDate.params.value.rangeOffset,
      rangePanOffset: params.ctx.params.statDate.params.value.rangePanOffset,
    },
    filteredType: params.ctx.filteredType.value,
    parentCategoriesIds: params.ctx.filteredCategoriesIds.value,
    reportType: params.ctx.params.reportType.value,
    selectedCategoriesIds: params.ctx.params.filter.categoriesIds.value,
    selectedWalletsIds: params.ctx.params.filter.walletsIds.value,
  }))
  let previousReportScope = normalizeStatFeedScope(reportScope.value)
  watch(
    reportScope,
    (scope) => {
      if (!isSameStatFeedScope(previousReportScope, scope))
        void resetFeed()
      previousReportScope = normalizeStatFeedScope(scope)
    },
    { deep: true },
  )
  watch(
    () => params.ctx.params.statDate.scrollRangeResetVersion.value,
    () => void resetFeed(),
  )
  watch(params.infinite.rows, () => nextTick(scheduleGeometryUpdate))

  async function start() {
    observeGeometry()
    await nextTick()
    updateGeometry()
    await fillViewport()
  }
  onMounted(() => void start())
  onActivated(() => void start())
  onDeactivated(stopObservingGeometry)
  onBeforeUnmount(stopObservingGeometry)

  return {
    activeListenerCount,
    activeObserverCount,
    activePeriodTransitionCount,
    isFillingViewport,
    isReconciling,
    scrollMargin,
    stickyBottom,
  }
}
