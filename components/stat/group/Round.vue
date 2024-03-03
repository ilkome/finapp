<script setup lang="ts">
import { useStat } from '~/components/stat/useStat'
import useStatPage from '~/components/stat/useStatPage'
import useUIView from '~/components/layout/useUIView'
import { useCurrenciesStore } from '~/components/currencies/useCurrencies'
import { useCategoriesStore } from '~/components/categories/useCategories'

const props = defineProps<{
  typeText: string
}>()

const { typeText } = toRefs(props)
const { statPage } = useStatPage()
const { moneyTypes } = useStat()
const { ui } = useUIView()
const currenciesStore = useCurrenciesStore()
const categoriesStore = useCategoriesStore()
const roundRef = ref(null)

const isShow = computed(() => ui.showRoundCats && statPage.current[props.typeText]?.categoriesIds?.length)
const typeNumber = moneyTypes.find(t => t.id === props.typeText)?.type

/**
 * Get max width from child elements name or amount
 * Set different width for income and expense
 */
function updateWidth() {
  setTimeout(() => {
    const elements: Element[] = roundRef.value
      ?.querySelector(`[data-type-text="${props.typeText}"]`)
      ?.querySelectorAll('.js-getWidth')

    const minWidth: number = elements
      ? Math.max(...Array.from(elements).map(e => e.clientWidth)) || 60
      : 60

    roundRef.value
      ?.querySelector(`[data-type-text="${props.typeText}"]`)
      ?.style.setProperty('--minWidth', `${minWidth + 12}px`)
  }, 100)
}

watch(statPage.current[props.typeText]?.categoriesIds, updateWidth, { immediate: true })
watch(isShow, updateWidth, { immediate: true })
</script>

<template lang="pug">
.my-6.border-t.border-b.dark_border-neutral-800(v-if="isShow" ref="roundRef")
  .items.grid.py-2(:data-type-text="`${typeText}`")
    LazyStatGroupRoundItem(
      v-if="isShow"
      v-for="categoryId in statPage.current[typeText].categoriesIds"
      :category="categoriesStore.items[categoryId]"
      :categoryId="categoryId"
      :currencyCode="currenciesStore.base"
      :key="categoryId"
      :total="statPage.current.categories[categoryId][typeText]"
      :type="typeNumber"
    )

    template(v-if="statPage.filter.categoryId")
      template(v-for="categoryId in categoriesStore.getChildCategoriesIds(statPage.filter.categoryId)")
        template(v-if="!statPage.current[typeText].categoriesIds.includes(categoryId)")
          LazyStatGroupRoundItem(
            v-if="statPage.filter.categoryId"
            :category="categoriesStore.items[categoryId]"
            :categoryId="categoryId"
            :currencyCode="currenciesStore.base"
            :key="categoryId"
            :total="0"
            :type="typeNumber"
          )
</template>

<style lang="stylus" scoped>
.items
  grid-template-columns repeat(auto-fill, minmax(var(--minWidth), 1fr))
</style>
