import { watchDebounced } from '@vueuse/core'
import { civilDayStart } from '~~/utils/date/civil'

import type { HistoryColumnFiltersState, HistoryDescriptionFilter } from '~/components/trns/history/types'
import type { TrnsViewType } from '~/components/trns/types'

import { useCategoriesStore } from '~/components/categories/useCategoriesStore'
import { useFilter } from '~/components/filter/useFilter'
import { trnsViewTypes } from '~/components/trns/types'

const descriptionFilters: HistoryDescriptionFilter[] = ['all', 'with', 'without']

function firstQueryValue(value: unknown): string {
  if (Array.isArray(value))
    return value.find(item => typeof item === 'string') ?? ''
  return typeof value === 'string' ? value : ''
}

function parseNumber(value: unknown): number | null {
  const raw = firstQueryValue(value)
  if (!raw)
    return null
  const parsed = Number(raw)
  return Number.isFinite(parsed) ? parsed : null
}

function parseCivilDate(value: unknown): number | null {
  const parsed = parseNumber(value)
  return parsed !== null && civilDayStart(parsed) === parsed ? parsed : null
}

function parseType(value: unknown): TrnsViewType {
  const parsed = firstQueryValue(value) as TrnsViewType
  return trnsViewTypes.includes(parsed) ? parsed : 'all'
}

function parseDescription(value: unknown): HistoryDescriptionFilter {
  const parsed = firstQueryValue(value) as HistoryDescriptionFilter
  return descriptionFilters.includes(parsed) ? parsed : 'all'
}

export function useHistoryFilters() {
  const route = useRoute()
  const router = useRouter()
  const categoriesStore = useCategoriesStore()
  const entityFilter = useFilter()

  const search = ref(firstQueryValue(route.query.historySearch))
  const type = ref<TrnsViewType>(parseType(route.query.historyType))
  const description = ref<HistoryDescriptionFilter>(parseDescription(route.query.historyDescription))
  const dateStart = ref<number | null>(parseCivilDate(route.query.historyDateStart))
  const dateEnd = ref<number | null>(parseCivilDate(route.query.historyDateEnd))
  const amountMin = ref<string>(firstQueryValue(route.query.historyAmountMin))
  const amountMax = ref<string>(firstQueryValue(route.query.historyAmountMax))

  function replaceQuery(values: Record<string, number | string | null | undefined>) {
    router.replace({
      query: {
        ...route.query,
        ...Object.fromEntries(Object.entries(values).map(([key, value]) => [key, value === '' || value === null ? undefined : String(value)])),
      },
    })
  }

  function setType(value: TrnsViewType) {
    type.value = value
    replaceQuery({ historyType: value === 'all' ? undefined : value })
  }

  function setDescription(value: HistoryDescriptionFilter) {
    description.value = value
    replaceQuery({ historyDescription: value === 'all' ? undefined : value })
  }

  function setDateStart(value: number | null) {
    dateStart.value = value
    replaceQuery({ historyDateStart: value })
  }

  function setDateEnd(value: number | null) {
    dateEnd.value = value
    replaceQuery({ historyDateEnd: value })
  }

  watchDebounced(search, value => replaceQuery({ historySearch: value.trim() || undefined }), { debounce: 250 })
  watchDebounced([amountMin, amountMax], ([min, max]) => replaceQuery({
    historyAmountMax: max || undefined,
    historyAmountMin: min || undefined,
  }), { debounce: 250 })

  watch(() => route.query, (query) => {
    const nextSearch = firstQueryValue(query.historySearch)
    if (search.value !== nextSearch)
      search.value = nextSearch
    const nextMin = firstQueryValue(query.historyAmountMin)
    if (amountMin.value !== nextMin)
      amountMin.value = nextMin
    const nextMax = firstQueryValue(query.historyAmountMax)
    if (amountMax.value !== nextMax)
      amountMax.value = nextMax
    const nextType = parseType(query.historyType)
    if (type.value !== nextType)
      type.value = nextType
    const nextDescription = parseDescription(query.historyDescription)
    if (description.value !== nextDescription)
      description.value = nextDescription
    const nextDateStart = parseCivilDate(query.historyDateStart)
    if (dateStart.value !== nextDateStart)
      dateStart.value = nextDateStart
    const nextDateEnd = parseCivilDate(query.historyDateEnd)
    if (dateEnd.value !== nextDateEnd)
      dateEnd.value = nextDateEnd
  })

  const expandedCategoryIds = computed(() => categoriesStore.getTransactibleIds(entityFilter.categoriesIds.value))
  const parsedAmountMin = computed(() => parseNumber(amountMin.value))
  const parsedAmountMax = computed(() => parseNumber(amountMax.value))

  const columnFilters = computed<HistoryColumnFiltersState>(() => {
    const values: HistoryColumnFiltersState = []
    if (type.value !== 'all')
      values.push({ id: 'type', value: type.value })
    if (description.value !== 'all')
      values.push({ id: 'description', value: description.value })
    if (entityFilter.walletsIds.value.length)
      values.push({ id: 'walletLabel', value: entityFilter.walletsIds.value })
    if (expandedCategoryIds.value.length)
      values.push({ id: 'categoryPath', value: expandedCategoryIds.value })
    if (dateStart.value !== null || dateEnd.value !== null)
      values.push({ id: 'date', value: { end: dateEnd.value ?? undefined, start: dateStart.value ?? undefined } })
    if (parsedAmountMin.value !== null || parsedAmountMax.value !== null)
      values.push({ id: 'amountInBase', value: { max: parsedAmountMax.value ?? undefined, min: parsedAmountMin.value ?? undefined } })
    return values
  })

  const hasFilters = computed(() => !!search.value.trim()
    || columnFilters.value.length > 0
    || entityFilter.categoriesIds.value.length > 0
    || entityFilter.walletsIds.value.length > 0)

  function clear() {
    search.value = ''
    type.value = 'all'
    description.value = 'all'
    dateStart.value = null
    dateEnd.value = null
    amountMin.value = ''
    amountMax.value = ''
    router.replace({ query: undefined })
  }

  return {
    amountMax,
    amountMin,
    clear,
    columnFilters,
    dateEnd,
    dateStart,
    description,
    entityFilter,
    hasFilters,
    search,
    setDateEnd,
    setDateStart,
    setDescription,
    setType,
    type,
  }
}

export type HistoryFiltersController = ReturnType<typeof useHistoryFilters>
