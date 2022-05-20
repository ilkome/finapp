<script>
import useStatPage from '~/components/stat/useStatPage'
import useUIView from '~/components/layout/useUIView'

export default defineComponent({
  props: {
    typeText: { type: String, required: true },
  },

  setup(props) {
    const { typeText } = toRefs(props)
    const { statPage } = useStatPage()
    const { ui } = useUIView()

    const isShow = computed(() => ui.showPieChart && statPage.current[typeText.value]?.categoriesIds?.length)

    return {
      isShow,
    }
  },
})
</script>

<template lang="pug">
.my-6(v-if="isShow")
  LazyStatGroupPieChart(
    v-if="isShow"
    :amountType="typeText"
  )
</template>
