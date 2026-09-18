import type { MaybeRefOrGetter } from 'vue'

import { computed, toValue } from 'vue'

import { getStatNavigationSnapshot, getStatSnapshotQueryId, isStatDrilldownQuery } from '~/components/stat/navigation'

/**
 * A wallet/category page opened from a stat report is a drilldown: it seeds from the
 * snapshot in the query and keeps its own state in sessionStorage so the regular
 * page settings stay untouched.
 */
export function useStatDrilldownPage({ id, kind }: { id: MaybeRefOrGetter<string>, kind: 'category' | 'wallet' }) {
  const route = useRoute()
  const statSnapshotId = getStatSnapshotQueryId(route.query.statSnapshot)
  const statSnapshot = getStatNavigationSnapshot(statSnapshotId)
  const isStatDrilldown = statSnapshotId !== null || isStatDrilldownQuery(route.query.statDrilldown)
  const storageQuery = computed(() => isStatDrilldown ? {} : undefined)
  const storageKey = computed(() => isStatDrilldown
    ? `stat-drilldown-${kind}-${toValue(id)}`
    : kind === 'category' ? `page-${toValue(id)}` : `${toValue(id)}`)

  return {
    isStatDrilldown,
    statSnapshot,
    storage: isStatDrilldown ? sessionStorage : localStorage,
    storageKey,
    storageQuery,
  }
}
