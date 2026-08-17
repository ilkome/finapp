import { useElementSize, useMediaQuery } from '@vueuse/core'

import type { StatHeaderInstance, StatPageHostOptions } from '~/components/stat/page/types'

import { statStickyNavKey, statStickyTopKey, statVirtualFeedKey } from '~/components/stat/injectionKeys'

export function useStatPageHost(options: StatPageHostOptions = {}) {
  const stickyNavigation = options.stickyNavigation ?? true
  const virtualFeed = options.virtualFeed ?? true
  const statHeader = useTemplateRef<StatHeaderInstance>('statHeader')
  const isDesktopHeader = useMediaQuery('(min-width: 768px)')
  const statHeaderElement = computed(() => isDesktopHeader.value
    ? statHeader.value?.stickyRootElement
    : statHeader.value?.stickyMainElement)
  // The border box includes header padding, keeping sticky content below the visual header edge.
  const { height: statStickyTop } = useElementSize(statHeaderElement, undefined, { box: 'border-box' })

  provide(statStickyNavKey, stickyNavigation)
  provide(statStickyTopKey, statStickyTop)
  provide(statVirtualFeedKey, virtualFeed)

  return { statHeader }
}
