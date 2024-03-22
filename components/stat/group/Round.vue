<script setup lang="ts">
import { useWindowSize } from '@vueuse/core'
import type { CategoryId } from '~/components/categories/types'
import type { MoneyTypeNumber, MoneyTypeSlug } from '~/components/stat/types'
import { useCategoriesStore } from '~/components/categories/useCategories'
import { useCurrenciesStore } from '~/components/currencies/useCurrencies'
import { useFilter } from '~/components/filter/useFilter'

const props = defineProps<{
  categoriesTotal: any
  categoriesIds: CategoryId[]
  moneyTypeSlug: MoneyTypeSlug
  moneyTypeNumber: MoneyTypeNumber
}>()

const categoriesStore = useCategoriesStore()
const currenciesStore = useCurrenciesStore()
const filterStore = useFilter()
const { width } = useWindowSize()

const roundRef = ref(null)

/**
 * Get max width from child elements name or amount
 * Set different width for income and expense
 */
function updateWidth() {
  setTimeout(() => {
    const elements: Element[] = roundRef.value
      ?.querySelector(`[data-type-text="${props.moneyTypeSlug}"]`)
      ?.querySelectorAll('.js-getWidth')

    const minWidth: number = elements
      ? Math.max(...Array.from(elements).map(e => e.clientWidth)) || 60
      : 60

    roundRef.value
      ?.querySelector(`[data-type-text="${props.moneyTypeSlug}"]`)
      ?.style.setProperty('--minWidth', `${minWidth + 12}px`)
  }, 100)
}

watch([width, () => props.categoriesIds], () => updateWidth(), { immediate: true })
</script>

<template>
  <div
    v-if="categoriesIds.length > 0"
    ref="roundRef"
    class="rounded-lg bg-item-4"
  >
    <div class="items grid" :data-type-text="`${moneyTypeSlug}`">
      <LazyStatGroupRoundItem
        v-for="categoryId in categoriesIds"
        :key="categoryId"
        :category="categoriesStore.items[categoryId]"
        :categoryId="categoryId"
        :currencyCode="currenciesStore.base"
        :total="categoriesTotal[moneyTypeSlug][categoryId]"
        :moneyTypeNumber="moneyTypeNumber"
      />

      <template v-if="filterStore.catsIds.length > 0">
        <LazyStatGroupRoundItem
          v-for="categoryId in filterStore.catsIds"
          :key="categoryId"
          :category="categoriesStore.items[categoryId]"
          :categoryId="categoryId"
          :currencyCode="currenciesStore.base"
          :total="0"
          :moneyTypeNumber="moneyTypeNumber"
        />
      </template>
    </div>
  </div>
</template>

<style lang="stylus" scoped>
.items
  grid-template-columns repeat(auto-fill, minmax(var(--minWidth), 1fr))
</style>
