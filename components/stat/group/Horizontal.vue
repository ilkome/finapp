<script setup lang="ts">
import useStat from '~/components/stat/useStat'
import useStatPage from '~/components/stat/useStatPage'
import useUIView from '~/components/layout/useUIView'

const props = defineProps<{
  typeText: String
}>()

const { statPage } = useStatPage()
const { ui } = useUIView()
const { moneyTypes } = useStat()

const isShow = computed(() =>
  ui.showCatsHorizontalList && statPage.current[props.typeText]?.categoriesIds?.length)

const typeNumber = moneyTypes.find(t => t.id === props.typeText)?.type
</script>

<template lang="pug">
.my-6.flex.flex-col.gap-2(v-if="isShow")
  StatGroupHorizontalItem(
    v-for="categoryId in statPage.current[typeText].categoriesIds"
    :key="categoryId"
    :biggest="statPage.current[typeText].biggest"
    :category="$store.state.categories.items[categoryId]"
    :categoryId="categoryId"
    :total="statPage.current.categories[categoryId][typeText]"
    :type="typeNumber"
  )
</template>
