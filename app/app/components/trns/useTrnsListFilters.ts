import type { TabsItem } from '@nuxt/ui'
import type { ComputedRef } from 'vue'

import type { TrnId, TrnsViewType } from '~/components/trns/types'

import { getFilteredByTypeIds, getTypeCounts } from '~/components/trns/tabClassification'
import { TrnType } from '~/components/trns/types'
import { useTrnsStore } from '~/components/trns/useTrnsStore'

type UseTrnsListFiltersOptions = {
  ids: ComputedRef<TrnId[]>
  showExpense: ComputedRef<boolean>
  showIncome: ComputedRef<boolean>
  showTransfers: ComputedRef<boolean>
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

  const isShowWithDesc = ref(false)
  const filterBy = ref<TrnsViewType | 'all'>('all')

  const typeCounts = computed(() => getTypeCounts(options.ids.value, trnsStore.items))

  const realTypesCount = computed(() => {
    const c = typeCounts.value
    return (c.expense > 0 ? 1 : 0) + (c.income > 0 ? 1 : 0) + (c.transfer > 0 ? 1 : 0) + (c.adjustment > 0 ? 1 : 0)
  })

  const typeFilters = computed<TypeFilter[]>(() => {
    const counts = typeCounts.value
    const filters: TypeFilter[] = [
      { count: options.ids.value.length, isShow: true, name: t('common.all'), slug: 'all', type: undefined },
      { count: counts.expense, isShow: options.showExpense.value && counts.expense > 0, name: t('money.expense'), slug: 'expense', type: TrnType.Expense },
      { count: counts.income, isShow: options.showIncome.value && counts.income > 0, name: t('money.income'), slug: 'income', type: TrnType.Income },
      { count: counts.transfer, isShow: options.showTransfers.value && counts.transfer > 0, name: t('transfer.titleMoney'), slug: 'transfer', type: TrnType.Transfer },
      { count: counts.adjustment, isShow: counts.adjustment > 0, name: t('trnForm.adjustmentTitle'), slug: 'adjustment', type: undefined },
    ]
    return filters.filter(item => item.isShow)
  })

  watch(typeFilters, (tabs) => {
    if (filterBy.value === 'all')
      return

    const selected = tabs.find(tab => tab.slug === filterBy.value)
    if (!selected || selected.count === 0)
      filterBy.value = 'all'
  })

  const selectedTypeFilter = computed(() => typeFilters.value.find(item => item.slug === filterBy.value))

  const filteredByTypeIds = computed(() =>
    getFilteredByTypeIds(options.ids.value, trnsStore.items, filterBy.value, selectedTypeFilter.value?.type),
  )

  const isTrnsWithDesc = computed(() => filteredByTypeIds.value.some(id => trnsStore.items?.[id]?.desc))
  const isAllTrnsWithDesc = computed(() => filteredByTypeIds.value.every(id => trnsStore.items?.[id]?.desc))

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
    filterBy.value = filterBy.value === type ? 'all' : (type ?? 'all')
  }

  return {
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
