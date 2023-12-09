<script setup lang="ts">
import useStatPage from '~/components/stat/useStatPage'
import useUIView from '~/components/layout/useUIView'

const props = defineProps<{
  typeText: string
}>()

const { typeText } = toRefs(props)
const { statPage } = useStatPage()
const { ui } = useUIView()

const isShow = computed(() => ui.showCatsVerticalChart && statPage.current[typeText.value]?.categoriesIds?.length)
</script>

<template lang="pug">
.my-6.py-1.flex.flex-col.gap-2(
  v-if="isShow"
)
  LazyStatCatsPeriodCatsChart(
    v-if="isShow"
    :type="typeText"
  )
</template>
