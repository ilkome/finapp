import type { MaybeRefOrGetter, Ref } from 'vue'
import type { Range } from '~~/utils/date/types'

import type { CategoryId } from '~/components/categories/types'
import type { FilterProvider } from '~/components/filter/types'
import type { useStatConfig } from '~/components/stat/config/useStatConfig'
import type { TrnId } from '~/components/trns/types'
import type { WalletId } from '~/components/wallets/types'

import { useCategoriesStore } from '~/components/categories/useCategoriesStore'
import { getParentCategoryIdOrUndefined } from '~/components/categories/utils'
import { collectCategoriesByTrns } from '~/components/stat/categories/collectAndGroup'
import { applyConfigUpdate } from '~/components/stat/config/schema'
import { statConfigKey, statViewControllerKey } from '~/components/stat/injectionKeys'
import { createBlockRuleOverrides, findMatchingBlockRule, resolveBlockRuleParameterIds, resolveConfigUpdatePanel, resolveConfigUpdateParameterIds, resolveEffectiveStatConfig, resolveHiddenStatPanels } from '~/components/stat/views/blockRules'
import { useStatViewController } from '~/components/stat/views/useStatViewController'
import { useTrnsStore } from '~/components/trns/useTrnsStore'

type UseStatPageViewsOptions = {
  categoryId?: MaybeRefOrGetter<CategoryId | undefined>
  contentWidth: Ref<number | null>
  filter: FilterProvider
  range: Readonly<Ref<Range>>
  statConfig: ReturnType<typeof useStatConfig>
  trnsIds: Readonly<Ref<TrnId[]>>
  walletId?: MaybeRefOrGetter<WalletId | undefined>
}

export function useStatPageViews(options: UseStatPageViewsOptions) {
  const categoriesStore = useCategoriesStore()
  const trnsStore = useTrnsStore()

  const context = computed(() => {
    const categoryId = toValue(options.categoryId)
    const walletId = toValue(options.walletId)
    const rangeTrnsIds = trnsStore.getStoreTrnsIds({
      dates: options.range.value,
      trnsIds: options.trnsIds.value,
    })
    const categoryIds = Object.keys(collectCategoriesByTrns({
      categoriesItems: categoriesStore.items,
      excludedCategoriesIds: categoriesStore.excludedFromStatsIds,
      trnsIds: rangeTrnsIds,
      trnsItems: trnsStore.items ?? {},
    }))
    const parentIds = new Set(categoryIds.map(id => getParentCategoryIdOrUndefined(categoriesStore.items, id) ?? id))
    const categoryPathById = Object.fromEntries(Object.keys(categoriesStore.items).map((id) => {
      const path = [id]
      const seen = new Set(path)
      let parentId = categoriesStore.items[id]?.parentId
      while (parentId && !seen.has(String(parentId))) {
        const nextId = String(parentId)
        path.push(nextId)
        seen.add(nextId)
        parentId = categoriesStore.items[nextId]?.parentId
      }
      return [id, path]
    }))

    return {
      categoryCount: categoryIds.length,
      categoryPathById,
      contentWidth: options.contentWidth.value,
      parentCategoryCount: parentIds.size,
      range: options.range.value,
      selectedCategoryIds: [...new Set([
        ...(categoryId ? [categoryId] : []),
        ...options.filter.categoriesIds.value,
      ])],
      selectedWalletIds: [...new Set([
        ...(walletId ? [walletId] : []),
        ...options.filter.walletsIds.value,
      ])],
    }
  })

  const controller = useStatViewController(options.statConfig.config, context)
  provide(statViewControllerKey, controller)

  const effectiveConfig = computed(() => {
    const view = controller.activeView.value
    return view
      ? resolveEffectiveStatConfig(options.statConfig.config.value, view.config.blockRules, context.value)
      : options.statConfig.config.value
  })
  const hiddenPanels = computed(() => {
    const view = controller.activeView.value
    return view ? resolveHiddenStatPanels(view.config.blockRules, context.value) : []
  })

  function updateEffectiveConfig<K extends keyof typeof options.statConfig.config.value>(key: K, value: Parameters<typeof options.statConfig.updateConfig<K>>[1]) {
    const panel = resolveConfigUpdatePanel(key, value)
    const rules = panel ? controller.activeView.value?.config.blockRules[panel] : undefined
    const matchingRule = findMatchingBlockRule(rules, context.value)
    if (!panel || !matchingRule) {
      options.statConfig.updateConfig(key, value)
      return
    }
    const edited = applyConfigUpdate(effectiveConfig.value, key, value)
    if (!edited)
      return
    const parameterIds = [
      ...resolveBlockRuleParameterIds(panel, matchingRule),
      ...resolveConfigUpdateParameterIds(panel, key, value),
    ]
    void controller.updateBlockRules(panel, rules!.map(rule => rule.id === matchingRule.id
      ? {
          ...rule,
          overrides: createBlockRuleOverrides(panel, options.statConfig.config.value, edited, parameterIds),
          parameterIds: [...new Set(parameterIds)],
        }
      : rule))
  }

  provide(statConfigKey, { config: effectiveConfig, updateConfig: updateEffectiveConfig })

  onMounted(() => {
    if (!controller.store.isLoaded)
      void controller.store.init('dashboard')
  })

  return { controller, hiddenPanels }
}
