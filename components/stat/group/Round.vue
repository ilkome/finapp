<script setup lang="ts">
import { useWindowSize } from '@vueuse/core'
import type { CategoryId } from '~/components/categories/types'
import type { MoneyTypeNumber, MoneyTypeSlug } from '~/components/stat/types'
import { useCategoriesStore } from '~/components/categories/useCategories'
import { useCurrenciesStore } from '~/components/currencies/useCurrencies'
import { useFilter } from '~/components/filter/useFilter'

const props = defineProps<{
  categories: any
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

watch([width, () => props.categories], () => updateWidth(), { immediate: true })
</script>

<template>
  <div
    v-if="categories.length > 0"
    ref="roundRef"
    class="_rounded-lg _bg-item-4 _border-t _border-b border-item-6"
  >
    <div class="items grid" :data-type-text="`${moneyTypeSlug}`">
      <LazyStatGroupRoundItem
        v-for="item in categories"
        :key="item.id"
        :category="categoriesStore.items[item.id]"
        :categoryId="item.id"
        :currencyCode="currenciesStore.base"
        :total="item.value"
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
