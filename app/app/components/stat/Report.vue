<script setup lang="ts">
import type { CategoryId } from '~/components/categories/types'
import type { SeriesSlugSelected, StatTabSlug } from '~/components/stat/types'
import type { TrnId } from '~/components/trns/types'
import type { WalletId } from '~/components/wallets/types'

import { filterKey } from '~/components/filter/injectionKeys'
import { statConfigKey, statDateKey, statStickyNavKey } from '~/components/stat/injectionKeys'
import { useScrollReveal } from '~/components/stat/useScrollReveal'
import { useStatReportContext } from '~/components/stat/useStatReportContext'

const props = defineProps<{
  categoryId?: CategoryId
  hasChildren?: boolean
  preCategoriesIds?: CategoryId[]
  statTab: StatTabSlug
  storageKey: string
  trnsIds: TrnId[]
  type?: SeriesSlugSelected
  walletId?: WalletId
}>()

const filter = inject(filterKey)!
const statDate = inject(statDateKey)!
const statConfig = inject(statConfigKey)!
// Dashboard pins the nav row + sum tiles to the top with the header's background.
const stickyNav = inject(statStickyNavKey, false)

const { chartFx, chartTrigger, dateFx, sumsFx } = useScrollReveal(stickyNav)

const ctx = useStatReportContext({
  // Exclude flagged categories only on the default aggregate: not on a single-category
  // page, and not when the top filter already narrows to categories.
  applyStatsExclusion: computed(() => !props.categoryId && !filter.categoriesIds.value.length),
  categoryId: computed(() => props.categoryId),
  filter,
  hasChildren: computed(() => props.hasChildren),
  preCategoriesIds: computed(() => props.preCategoriesIds),
  statConfig,
  statDate,
  statTab: computed(() => props.statTab),
  storageKey: computed(() => props.storageKey),
  trnsIds: computed(() => props.trnsIds),
  type: computed(() => props.type),
  walletId: computed(() => props.walletId),
})
</script>

<template>
  <div class="@container/stat">
    <div ref="chartTrigger">
      <div ref="chartFx">
        <StatReportChart :ctx="ctx" />
      </div>
    </div>

    <div class="grid min-w-0 content-start gap-3">
      <div
        class="grid gap-3"
        :class="stickyNav && 'bg-default/90 sticky top-0 z-10 -mx-2 px-2 backdrop-blur lg:-mx-4 lg:px-4 lg:pb-2'"
      >
        <div ref="dateFx" class="min-w-0">
          <StatDateFilterRow />
        </div>

        <div ref="sumsFx" class="min-w-0">
          <StatReportSums :ctx="ctx" />
        </div>
      </div>

      <StatReportDetails :ctx="ctx" />
    </div>
  </div>
</template>
