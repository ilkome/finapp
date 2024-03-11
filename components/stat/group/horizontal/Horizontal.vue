<script setup lang="ts">
import type { MoneyTypeSlug } from '~/components/stat/types'
import useStatPage from '~/components/stat/useStatPage'
import useUIView from '~/components/layout/useUIView'
import { useCategoriesStore } from '~/components/categories/useCategories'
import { useStat } from '~/components/stat/useStat'

const props = defineProps<{
  moneyTypeSlug: MoneyTypeSlug
}>()

const { statPage } = useStatPage()
const { ui } = useUIView()
const { moneyTypes } = useStat()
const categoriesStore = useCategoriesStore()

const isShow = computed(
  () =>
    statPage.current[props.moneyTypeSlug]?.categoriesIds?.length
    && ui.showCatsHorizontalList,
)

const typeNumber = moneyTypes.find(t => t.id === props.moneyTypeSlug)?.type
</script>

<template>
  <div v-if="isShow" class="flex flex-col gap-1">
    <StatGroupHorizontalItem
      v-for="categoryId in statPage.current[moneyTypeSlug].categoriesIds"
      :key="categoryId"
      :biggest="statPage.current[moneyTypeSlug].biggest"
      :category="categoriesStore.items[categoryId]"
      :categoryId="categoryId"
      :total="statPage.current.categories[categoryId][moneyTypeSlug]"
      :type="typeNumber"
    />
  </div>
</template>
