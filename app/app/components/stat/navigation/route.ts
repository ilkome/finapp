import type { CategoryId } from '~/components/categories/types'
import type { StatCategoryNavigationOptions, StatCategoryRouteOptions } from '~/components/stat/navigation/types'

import { saveStatNavigationSnapshot } from '~/components/stat/navigation/storage'

export function buildStatCategoryRoute(options: StatCategoryRouteOptions) {
  const categoriesIds = [...new Set(options.categoriesIds)]
  const walletsIds = [...new Set(options.walletsIds)]

  return {
    path: `/categories/${options.categoryId}`,
    query: {
      filterCategories: categoriesIds.length ? categoriesIds.join(',') : undefined,
      filterWallets: walletsIds.length ? walletsIds.join(',') : undefined,
      statDrilldown: options.isDrilldown ? 'true' : undefined,
      statSnapshot: options.snapshotId ?? undefined,
    },
  }
}

export function useStatCategoryNavigation(options: StatCategoryNavigationOptions) {
  const router = useRouter()

  return function openStatCategory(categoryId: CategoryId) {
    const snapshot = toValue(options.snapshot)
    const snapshotId = snapshot ? saveStatNavigationSnapshot(snapshot) : null

    return router.push(buildStatCategoryRoute({
      categoriesIds: toValue(options.categoriesIds),
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
