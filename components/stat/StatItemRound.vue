<script lang="ts">
import { ref, computed, useContext, onMounted, toRefs } from '@nuxtjs/composition-api'
import useFilter from '~/modules/filter/useFilter'

export default {
  name: 'StatItemRound',

  props: {
    category: {
      type: Object,
      required: true
    },
    categoryId: {
      type: String,
      required: true
    },
    currency: {
      type: String,
      required: true
    },
    total: {
      type: Number,
      required: true
    },
    biggest: {
      type: Number,
      required: true
    },
    type: {
      type: Number,
      required: true
    }
  },

  setup (props) {
    const { categoryId, type } = toRefs(props)
    const { store } = useContext()
    const { setCategoryFilter } = useFilter()

    const trnsIds = computed(() => {
      return store.getters['trns/getTrns']({
        categoryId: categoryId.value,
        type: type.value
      })
    })

    const filterPeriod = computed(() => store.state.filter.period)
    const statCurrentPeriod = computed(() => store.getters['stat/statCurrentPeriod'])

    // long press
    const item = ref(document.createElement('div'))
    onMounted(() => {
    // Long press for delete
      const element: HTMLElement = item.value
      element.addEventListener('long-press', () => {
        store.dispatch('trnForm/openTrnForm', {
          action: 'create'
        })

        const isCategoryHasChildren = computed(() => store.getters['categories/isCategoryHasChildren'](categoryId.value))
        console.log('isCategoryHasChildren', isCategoryHasChildren)

        if (isCategoryHasChildren.value) {
          store.commit('trnForm/showTrnFormModal', 'categories')
          store.commit('trnForm/showTrnFormModal', 'categoriesChild')
          store.commit('trnForm/setTrnFormModalCategoryId', categoryId.value)
        }
        else {
          store.commit('trnForm/setTrnFormValues', {
            categoryId: categoryId.value
          })
        }
      })
    })

    return {
      setCategoryFilter,
      trnsIds,
      filterPeriod,
      statCurrentPeriod,
      item
    }
  }
}
</script>

<template lang="pug">
.statItemRound(
  :class="{ _prevStat: total === 0 }"
  ref="item"
  data-long-press-delay="300"
  @click="setCategoryFilter(categoryId)"
)
  .statItemRound__icon
    Icon(
      :color="category.color"
      :icon="category.icon"
      background="transparent"
      round
    )

  .statItemRound__name {{ category.name }}
  .statItemRound__amount
    Amount(
      :currency="currency"
      :isColorize="false"
      :type="type"
      :value="total"
      isShowPrefix
      size="md"
    )
</template>

<style lang="stylus">
.layout
  .statItemRound
    &__icon
      .icon
        width auto
        height auto

      .icon__image
        font-size 28px
</style>

<style lang="stylus" scoped>
@import '~assets/stylus/variables'

.statItemRound
  overflow hidden
  cursor pointer
  position relative
  display flex
  align-items center
  justify-content center
  flex-flow column
  padding $m6
  border-radius $m6

  +media-hover()
    background var(--c-bg-3)

  &._prevStat
    opacity .5

  &._active
    margin-bottom $m9

  &__name
    align-self center
    padding 6px 0 2px 0
    color var(--c-font-4)
    font-size 12px
    text-align center

    ^[0]._active &
      color var(--c-font-2)
      font-weight 500

  &__icon
    +media-hover()
      opacity .8
      +media-laptop()
        transform scale(1.3)

  &__amount
    align-self center
</style>
