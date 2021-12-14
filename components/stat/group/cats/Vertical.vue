<script>
import { computed, toRefs, defineComponent } from '@nuxtjs/composition-api'
import useStatPage from '~/components/stat/useStatPage'
import useUIView from '~/components/layout/useUIView'

export default defineComponent({
  props: {
    typeText: { type: String, required: true }
  },

  setup (props) {
    const { typeText } = toRefs(props)
    const { statPage } = useStatPage()
    const { ui } = useUIView()

    const isShow = computed(() => ui.showCatsVerticalChart && statPage.current[typeText.value]?.categoriesIds?.length)

    return {
      isShow
    }
  }
})
</script>

<template lang="pug">
LazyStatCatsPeriodCatsChart(
  v-if="isShow"
  :type="typeText"
)
</template>
