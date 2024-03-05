<script setup lang="ts">
import type { MoneyTypeSlug } from '~/components/stat/types'
import useStatPage from '~/components/stat/useStatPage'
import useUIView from '~/components/layout/useUIView'
import { useCategoriesStore } from '~/components/categories/useCategories'
import { useStat } from '~/components/stat/useStat'

const props = defineProps<{
  typeText: MoneyTypeSlug
}>()

const { statPage } = useStatPage()
const { ui } = useUIView()
const { moneyTypes } = useStat()
const categoriesStore = useCategoriesStore()

const isShow = computed(
  () =>
    statPage.current[props.typeText]?.categoriesIds?.length
    && ui.showCatsHorizontalList,
)

const typeNumber = moneyTypes.find(t => t.id === props.typeText)?.type
</script>

<template>
  <div v-if="isShow" class="my-6 flex flex-col gap-2">
    <StatGroupHorizontalItem
      v-for="categoryId in statPage.current[typeText].categoriesIds"
      :key="categoryId"
      :biggest="statPage.current[typeText].biggest"
      :category="categoriesStore.items[categoryId]"
      :categoryId="categoryId"
      :total="statPage.current.categories[categoryId][typeText]"
      :type="typeNumber"
    />
  </div>
</template>
