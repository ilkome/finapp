<script setup lang="ts">
import type { MoneyTypeSlug } from '~/components/stat/types'
import useStatPage from '~/components/stat/useStatPage'
import useUIView from '~/components/layout/useUIView'

const props = defineProps<{
  typeText: MoneyTypeSlug
}>()

const { typeText } = toRefs(props)
const { statPage } = useStatPage()
const { ui } = useUIView()

const isShow = computed(
  () =>
    ui.showCatsVerticalChart
    && statPage.current[typeText.value]?.categoriesIds?.length > 1,
)
</script>

<template>
  <div v-if="isShow" class="my-6 flex flex-col gap-2 py-1">
    <LazyStatCatsPeriodCatsChart v-if="isShow" :type="typeText" />
  </div>
</template>
