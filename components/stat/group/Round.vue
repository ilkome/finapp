<script setup lang="ts">
import { useWindowSize } from '@vueuse/core'
import type { CategoryId } from '~/components/categories/types'
import type { MoneyTypeNumber, MoneyTypeSlug } from '~/components/stat/types'
import { useCategoriesStore } from '~/components/categories/useCategories'
import { useCurrenciesStore } from '~/components/currencies/useCurrencies'
import { useFilter } from '~/components/filter/useFilter'
import { useStat } from '~/components/stat/useStatStore'

const props = defineProps<{
  categoriesIds: CategoryId[]
  moneyTypeSlug: MoneyTypeSlug
  moneyTypeNumber: MoneyTypeNumber
}>()

const categoriesStore = useCategoriesStore()
const currenciesStore = useCurrenciesStore()
const filterStore = useFilter()
const statStore = useStat()
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
        :total="statStore.statCurrentPeriod.categories[categoryId][moneyTypeSlug]"
        :moneyTypeNumber="moneyTypeNumber"
      />

      <template v-if="filterStore.catsIds.length > 0">
        <template v-for="categoryId in filterStore.catsIds" :key="categoryId">
          <LazyStatGroupRoundItem
            v-if="!statStore.statCurrentPeriod[moneyTypeSlug].categoriesIds.includes(categoryId)"
            :key="categoryId"
            :category="categoriesStore.items[categoryId]"
            :categoryId="categoryId"
            :currencyCode="currenciesStore.base"
            :total="0"
            :moneyTypeNumber="moneyTypeNumber"
          />
        </template>
      </template>
    </div>
  </div>
</template>

<style lang="stylus" scoped>
.items
  grid-template-columns repeat(auto-fill, minmax(var(--minWidth), 1fr))
</style>
