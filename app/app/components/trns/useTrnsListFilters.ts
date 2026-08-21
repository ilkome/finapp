import type { TabsItem } from '@nuxt/ui'
import type { ComputedRef } from 'vue'

import type { TrnId, TrnsListFilterState, TrnsViewType } from '~/components/trns/types'

import { getFilteredByTypeIds, getTypeCounts } from '~/components/trns/tabClassification'
import { TrnType } from '~/components/trns/types'
import { useTrnsStore } from '~/components/trns/useTrnsStore'

type UseTrnsListFiltersOptions = {
  descriptionIds?: ComputedRef<TrnId[]>
  ids: ComputedRef<TrnId[]>
  primaryType?: ComputedRef<'expense' | 'income' | undefined>
  showExpense: ComputedRef<boolean>
  showIncome: ComputedRef<boolean>
  showTransfers: ComputedRef<boolean>
  state?: TrnsListFilterState
}

type TypeFilter = {
  count: number
  isShow: boolean
  name: string
  slug: TrnsViewType | 'all'
  type: TrnType | undefined
}

export function useTrnsListFilters(options: UseTrnsListFiltersOptions) {
  const trnsStore = useTrnsStore()
  const { t } = useI18n()

  const isShowWithDesc = options.state?.isShowWithDesc ?? ref(false)
  const filterBy = options.state?.filterBy ?? ref<TrnsViewType>('all')

  const typeCounts = computed(() => getTypeCounts(options.ids.value, trnsStore.items))

  const typeFilters = computed<TypeFilter[]>(() => {
    const counts = typeCounts.value
    const primaryType = options.primaryType?.value
    const isScoped = !!options.primaryType
    const filters: TypeFilter[] = [
      { count: options.ids.value.length, isShow: !isScoped || !primaryType, name: t('common.all'), slug: 'all', type: undefined },
      { count: counts.expense, isShow: options.showExpense.value && (!isScoped || primaryType === 'expense') && counts.expense > 0, name: t('money.expense'), slug: 'expense', type: TrnType.Expense },
      { count: counts.income, isShow: options.showIncome.value && (!isScoped || primaryType === 'income') && counts.income > 0, name: t('money.income'), slug: 'income', type: TrnType.Income },
      { count: counts.transfer, isShow: options.showTransfers.value && counts.transfer > 0, name: t('transfer.titleMoney'), slug: 'transfer', type: TrnType.Transfer },
      { count: counts.adjustment, isShow: counts.adjustment > 0, name: t('trnForm.adjustmentTitle'), slug: 'adjustment', type: undefined },
    ]
    return filters.filter(item => item.isShow)
  })
  const realTypesCount = computed(() => {
    if (options.primaryType)
      return typeFilters.value.length
    const counts = typeCounts.value
    return (counts.expense > 0 ? 1 : 0) + (counts.income > 0 ? 1 : 0) + (counts.transfer > 0 ? 1 : 0) + (counts.adjustment > 0 ? 1 : 0)
  })

  if (options.primaryType) {
    watch(options.primaryType, (primaryType) => {
      filterBy.value = primaryType ?? 'all'
    }, { immediate: true })
  }

  watch(typeFilters, (tabs) => {
    const selected = tabs.find(tab => tab.slug === filterBy.value)
    if (!selected || selected.count === 0)
      filterBy.value = options.primaryType?.value ?? 'all'
  })

  const selectedTypeFilter = computed(() => typeFilters.value.find(item => item.slug === filterBy.value))

  const filteredByTypeIds = computed(() =>
    getFilteredByTypeIds(options.ids.value, trnsStore.items, filterBy.value, selectedTypeFilter.value?.type),
  )
  const descriptionFilteredByTypeIds = computed(() => options.descriptionIds
    ? getFilteredByTypeIds(options.descriptionIds.value, trnsStore.items, filterBy.value, selectedTypeFilter.value?.type)
    : filteredByTypeIds.value)

  const isTrnsWithDesc = computed(() => descriptionFilteredByTypeIds.value.some(id => trnsStore.items?.[id]?.desc))
  const isAllTrnsWithDesc = computed(() => descriptionFilteredByTypeIds.value.every(id => trnsStore.items?.[id]?.desc))

  const descriptionSelectedIds = computed(() => {
    if (isShowWithDesc.value && isTrnsWithDesc.value)
      return descriptionFilteredByTypeIds.value.filter(id => trnsStore.items?.[id]?.desc)

    return descriptionFilteredByTypeIds.value
  })

  const selectedIds = computed(() => {
    if (isShowWithDesc.value && isTrnsWithDesc.value)
      return filteredByTypeIds.value.filter(id => trnsStore.items?.[id]?.desc)

    return filteredByTypeIds.value
  })

  const localFilter = computed(() => ({
    filterBy: filterBy.value,
    showWithDesc: isShowWithDesc.value && isTrnsWithDesc.value,
  }))

  const typeFilterItems = computed<TabsItem[]>(() => typeFilters.value.map(item => ({ label: item.name, value: item.slug })))

  function setFilterBy(type: TrnsViewType | 'all') {
    const defaultType = options.primaryType?.value ?? 'all'
    filterBy.value = filterBy.value === type ? defaultType : (type ?? defaultType)
  }

  return {
    descriptionSelectedIds,
    filterBy,
    filteredByTypeIds,
    isAllTrnsWithDesc,
    isShowWithDesc,
    isTrnsWithDesc,
    localFilter,
    realTypesCount,
    selectedIds,
    setFilterBy,
    typeFilterItems,
  }
}
