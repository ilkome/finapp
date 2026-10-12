import type { CategoryId } from '~/components/categories/types'
import type { StatCategoryNavigationOptions, StatCategoryRouteOptions, StatWalletRouteOptions } from '~/components/stat/navigation/types'
import type { SeriesSlugSelected } from '~/components/stat/types'

import { saveStatNavigationSnapshot } from '~/components/stat/navigation/storage'

export function buildStatCategoryRoute(options: StatCategoryRouteOptions) {
  const walletsIds = [...new Set(options.walletsIds)]

  return {
    path: `/categories/${options.categoryId}`,
    query: {
      filterWallets: walletsIds.length ? walletsIds.join(',') : undefined,
      statDrilldown: options.isDrilldown ? 'true' : undefined,
      statSnapshot: options.snapshotId ?? undefined,
    },
  }
}

export function buildStatWalletRoute(options: StatWalletRouteOptions) {
  const categoriesIds = [...new Set(options.categoriesIds)]

  return {
    path: `/wallets/${options.walletId}`,
    query: {
      filterCategories: categoriesIds.length ? categoriesIds.join(',') : undefined,
      statDrilldown: options.isDrilldown ? 'true' : undefined,
      statSnapshot: options.snapshotId ?? undefined,
    },
  }
}

export function useStatCategoryNavigation(options: StatCategoryNavigationOptions) {
  const router = useRouter()

  return function openStatCategory(categoryId: CategoryId, filteredType?: SeriesSlugSelected) {
    const baseSnapshot = toValue(options.snapshot)
    const snapshot = baseSnapshot && filteredType
      ? { ...baseSnapshot, filteredType }
      : baseSnapshot
    const snapshotId = snapshot ? saveStatNavigationSnapshot(snapshot) : null

    return router.push(buildStatCategoryRoute({
      categoryId,
      isDrilldown: snapshot !== null,
      snapshotId,
      walletsIds: toValue(options.walletsIds),
    }))
  }
}

export function isStatDrilldownQuery(value: unknown): boolean {
  return value === 'true'
}
