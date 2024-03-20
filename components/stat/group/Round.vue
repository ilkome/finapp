<script setup lang="ts">
import { useWindowSize } from '@vueuse/core'
import { moneyTypes } from '~/components/stat/types'
import type { MoneyTypeSlug } from '~/components/stat/types'
import useUIView from '~/components/layout/useUIView'
import { useCategoriesStore } from '~/components/categories/useCategories'
import { useCurrenciesStore } from '~/components/currencies/useCurrencies'
import { useFilter } from '~/components/filter/useFilter'
import { useStat } from '~/components/stat/useStatStore'

const props = defineProps<{
  moneyTypeSlug: MoneyTypeSlug
}>()

const categoriesStore = useCategoriesStore()
const currenciesStore = useCurrenciesStore()
const filterStore = useFilter()
const statStore = useStat()
const { ui } = useUIView()
const { width } = useWindowSize()

const roundRef = ref(null)

const isShow = computed(
  () =>
    ui.value.showRoundCats
    && statStore.statCurrentPeriod[props.moneyTypeSlug]?.categoriesIds?.length,
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

watch(
  [
    isShow,
    width,
    () => statStore.statCurrentPeriod[props.moneyTypeSlug]?.categoriesIds,
  ],
  () => updateWidth(),
  { immediate: true },
)
</script>

<template>
  <div v-if="isShow" ref="roundRef" class="rounded-lg bg-item-4">
    <div class="items grid" :data-type-text="`${moneyTypeSlug}`">
      <LazyStatGroupRoundItem
        v-for="categoryId in statStore.statCurrentPeriod[moneyTypeSlug].categoriesIds"
        :key="categoryId"
        :category="categoriesStore.items[categoryId]"
        :categoryId="categoryId"
        :currencyCode="currenciesStore.base"
        :total="statStore.statCurrentPeriod.categories[categoryId][moneyTypeSlug]"
        :type="typeNumber"
      />

      <template v-if="filterStore.catsIds.length > 0">
        <template v-for="categoryId in filterStore.catsIds" :key="categoryId">
          <template
            v-if="
              !statStore.statCurrentPeriod[moneyTypeSlug].categoriesIds.includes(
                categoryId,
              )
            "
          >
            <LazyStatGroupRoundItem
              v-if="categoryId"
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
