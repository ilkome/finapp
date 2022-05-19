<script>
import useStat from '~/modules/stat/useStat'
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
    const { moneyTypes } = useStat()

    const isShow = computed(() => ui.showCatsHorizontalList && statPage.current[typeText.value]?.categoriesIds?.length)
    const typeNumber = moneyTypes.find(t => t.id === typeText.value)?.type

    return {
      statPage,
      isShow,
      typeNumber,
    }
  },
})
</script>

<template lang="pug">
.my-6.flex.flex-col.gap-2(v-if="isShow")
  StatItem(
    v-for="categoryId in statPage.current[typeText].categoriesIds"
    :key="categoryId"
    :biggest="statPage.current[typeText].biggest"
    :category="$store.state.categories.items[categoryId]"
    :categoryId="categoryId"
    :currencyCode="$store.state.currencies.base"
    :total="statPage.current.categories[categoryId][typeText]"
    :type="typeNumber"
  )
</template>
