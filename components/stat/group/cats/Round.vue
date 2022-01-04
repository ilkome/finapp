<script>
import { ref, computed, watch, toRefs, defineComponent } from '#app'
import useStat from '~/modules/stat/useStat'
import useStatPage from '~/components/stat/useStatPage'
import useUIView from '~/components/layout/useUIView'

export default defineComponent({
  props: {
    typeText: { type: String, required: true }
  },

  setup (props) {
    const { typeText } = toRefs(props)
    const { statPage } = useStatPage()
    const { moneyTypes } = useStat()
    const { ui } = useUIView()
    const incomesRef = ref(null)
    const expensesRef = ref(null)

    const isShow = computed(() => ui.showRoundCats && statPage.current[typeText.value]?.categoriesIds?.length)
    const typeNumber = moneyTypes.find(t => t.id === typeText.value)?.type

    /**
     * Watch for changes in categories
     * Get max width from child elements name or amount
     * Set different width for incomes and expenses
     */
    watch(() => statPage.current[typeText.value]?.categoriesIds, () => {
      setTimeout(() => {
        let minWidth = 60
        let childs
        typeText.value === 'incomes'
          ? childs = incomesRef.value?.querySelectorAll('.js-getWidth')
          : childs = expensesRef.value?.querySelectorAll('.js-getWidth')

        if (!childs) return

        for (const key in childs) {
          if (childs[key].clientWidth > minWidth)
            minWidth = childs[key].clientWidth
        }
        typeText.value === 'incomes'
          ? incomesRef.value.style.setProperty('--minWidth', `${minWidth + 12}px`)
          : expensesRef.value.style.setProperty('--minWidth', `${minWidth + 12}px`)
      }, 100)
    }, { immediate: true })

    return {
      statPage,
      isShow,
      typeNumber,
      incomesRef,
      expensesRef
    }
  }
})
</script>

<template lang="pug">
.pb-5(v-if="isShow")
  .items.grid(:ref="`${typeText}Ref`")
    LazyStatItemRound(
      v-if="isShow"
      v-for="categoryId in statPage.current[typeText].categoriesIds"
      :category="$store.state.categories.items[categoryId]"
      :categoryId="categoryId"
      :currency="$store.state.currencies.base"
      :key="categoryId"
      :total="statPage.current.categories[categoryId][typeText]"
      :type="typeNumber"
    )

    template(v-if="statPage.filter.categoryId")
      template(v-for="categoryId in $store.getters['categories/getChildCategoriesIds'](statPage.filter.categoryId)")
        template(v-if="!statPage.current[typeText].categoriesIds.includes(categoryId)")
          LazyStatItemRound(
            v-if="statPage.filter.categoryId"
            :category="$store.state.categories.items[categoryId]"
            :categoryId="categoryId"
            :currency="$store.state.currencies.base"
            :key="categoryId"
            :total="0"
            :type="typeNumber"
          )
</template>

<style lang="stylus" scoped>
.items
  grid-template-columns repeat(auto-fill, minmax(var(--minWidth), 1fr))
</style>
