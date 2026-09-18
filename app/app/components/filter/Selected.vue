<script setup lang="ts">
import type { FilterChip } from '~/components/filter/types'

import { useCategoriesStore } from '~/components/categories/useCategoriesStore'
import { useCurrenciesStore } from '~/components/currencies/useCurrenciesStore'
import { extrasChips } from '~/components/filter/extras'
import { filterKey } from '~/components/filter/injectionKeys'
import { useExtrasLabels } from '~/components/filter/useExtrasLabels'
import { useFilterSummary } from '~/components/filter/useFilterSummary'
import { useWalletsStore } from '~/components/wallets/useWalletsStore'

const props = defineProps<{
  isShowCategories?: boolean
  isShowWallets?: boolean
}>()

const { t } = useI18n()
const filter = inject(filterKey)!
const walletsStore = useWalletsStore()
const categoriesStore = useCategoriesStore()
const currenciesStore = useCurrenciesStore()
const { displayCategoryIds } = useFilterSummary()
const { chipLabels } = useExtrasLabels()

const chips = computed<FilterChip[]>(() => [
  ...(props.isShowWallets
    ? filter.walletsIds.value.flatMap((walletId) => {
        const wallet = walletsStore.itemsComputed[walletId]
        return wallet ? [{ key: `wallet-${walletId}`, kind: 'wallet' as const, tooltip: `${t('trns.fields.wallet')}: ${wallet.name}`, wallet, walletId }] : []
      })
    : []),
  ...(props.isShowCategories
    ? displayCategoryIds.value.flatMap((categoryId) => {
        const category = categoriesStore.items[categoryId]
        return category ? [{ category, categoryId, key: `category-${categoryId}`, kind: 'category' as const, tooltip: `${t('trns.fields.category')}: ${category.name}` }] : []
      })
    : []),
  ...extrasChips(filter.extras.value, currenciesStore.base, chipLabels.value)
    .map(chip => ({ icon: chip.icon, key: `extra-${chip.key}`, kind: 'extra' as const, label: chip.label, patch: chip.patch, tooltip: chip.tooltip })),
])

function remove(chip: FilterChip) {
  if (chip.kind === 'wallet') {
    filter.removeWalletId(chip.walletId)
    return
  }
  if (chip.kind === 'extra') {
    filter.setExtras(chip.patch)
    return
  }
  // A parent chip stands for all of its selected children.
  const children = categoriesStore.getChildrenIds(chip.categoryId)
  const selected = filter.categoriesIds.value
  if (children.length && children.every(id => selected.includes(id)))
    filter.removeCategories(children)
  else
    filter.removeCategoryId(chip.categoryId)
}
</script>

<template>
  <FilterChipsView :chips @remove="remove" />
</template>
