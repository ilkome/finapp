<script setup lang="ts">
import { useWindowSize } from '@vueuse/core'
import { useStat } from '~/components/stat/useStat'
import useStatPage from '~/components/stat/useStatPage'
import useUIView from '~/components/layout/useUIView'
import { useCurrenciesStore } from '~/components/currencies/useCurrencies'
import { useCategoriesStore } from '~/components/categories/useCategories'
import type { MoneyTypeSlug } from '~/components/stat/types'

const props = defineProps<{
  moneyTypeSlug: MoneyTypeSlug
}>()

const { width } = useWindowSize()
const { statPage } = useStatPage()
const { moneyTypes } = useStat()
const { ui } = useUIView()
const currenciesStore = useCurrenciesStore()
const categoriesStore = useCategoriesStore()
const roundRef = ref(null)

const isShow = computed(
  () =>
    ui.value.showRoundCats && statPage.current[props.moneyTypeSlug]?.categoriesIds?.length,
)
const typeNumber = moneyTypes.find(t => t.id === props.moneyTypeSlug)?.type

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

watch(statPage.current[props.moneyTypeSlug]?.categoriesIds, updateWidth, {
  immediate: true,
})

watch(isShow, updateWidth, { immediate: true })
watch(width, updateWidth)
</script>

<template>
  <div v-if="isShow" ref="roundRef" class="rounded-lg bg-item-4 px-2">
    <div class="items grid py-2" :data-type-text="`${moneyTypeSlug}`">
      <LazyStatGroupRoundItem
        v-for="categoryId in statPage.current[moneyTypeSlug].categoriesIds"
        :key="categoryId"
        :category="categoriesStore.items[categoryId]"
        :categoryId="categoryId"
        :currencyCode="currenciesStore.base"
        :total="statPage.current.categories[categoryId][moneyTypeSlug]"
        :type="typeNumber"
      />

      <template v-if="statPage.filter.categoryId">
        <template
          v-for="categoryId in categoriesStore.getChildCategoriesIds(
            statPage.filter.categoryId,
          )"
        >
          <template
            v-if="
              !statPage.current[moneyTypeSlug].categoriesIds.includes(categoryId)
            "
          >
            <LazyStatGroupRoundItem
              v-if="statPage.filter.categoryId"
              :key="categoryId"
              :category="categoriesStore.items[categoryId]"
              :categoryId="categoryId"
              :currencyCode="currenciesStore.base"
              :total="0"
              :type="typeNumber"
            />
          </template>
        </template>
      </template>
    </div>
  </div>
</template>

<style lang="stylus" scoped>
.items
  grid-template-columns repeat(auto-fill, minmax(var(--minWidth), 1fr))
</style>
