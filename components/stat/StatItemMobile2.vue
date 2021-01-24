<script>
export default {
  name: 'StatItemMobile2',

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

  computed: {
    trnsIds () {
      return this.$store.getters['trns/getTrns']({
        categoryId: this.categoryId,
        type: this.type
      })
    },

    summary () {
      return this.$store.getters['trns/getTotalOfTrnsIds'](this.trnsIds)
    },

    showChildCategories () {
      const childCategoriesIds = this.$store.getters['categories/getChildCategoriesIds'](this.categoryId)

      const childCatsIdsWithTrns = []
      for (const childCategoryId of childCategoriesIds) {
        const trnsIds = this.$store.getters['trns/getTrnsIdsByFilter']({
          categoryId: childCategoryId,
          type: this.type
        })
        if (trnsIds.length > 0) { childCatsIdsWithTrns.push(childCategoryId) }
      }

      if (childCatsIdsWithTrns.length > 0) { return true }
      return false
    },

    styles () {
      return {
        width: `${Math.abs(this.total) / Math.abs(this.biggest) * 100}%`,
        background: this.category.color
      }
    },

    filterPeriod () {
      return this.$store.state.filter.period
    },

    statCurrentPeriod () {
      return this.$store.getters['stat/statCurrentPeriod']
    }
  }
}
</script>

<template lang="pug">
.statItem(
  @click="$store.dispatch('filter/handleSetFilterCategory', categoryId)"
)
  .statItem__content
    .statItem__graph: .statItem__graph__in(:style="styles")
    .statItem__icon
      Icon(
        :color="category.color"
        :icon="category.icon"
        background="transparent"
        big
        round
      )

    .statItem__name {{ category.name }}
    .statItem__amount
      Amount(
        :currency="currency"
        :value="total"
        :type="type"
        :isColorize="false"
        isShowPrefix
        size="md"
      )

  //- Modal
  //---------------------------------------------------------------------------
  Portal(
    v-if="$store.state.stat.categoryModal.id === categoryId && $store.state.stat.categoryModal.type === type"
    to="modal"
  )
    ModalBottom(
      center
      @onClose="$store.commit('stat/setCategoryModal', { id: null, type: null })"
    )
      template(slot="header")
        .categoryWrap
          .categoryIcon
            Icon(
              :icon="category.icon"
              :background="category.color || $store.state.ui.defaultBgColor"
              :round="true"
              :big="true"
            )
          .modalBottom__header__title {{ category.name }}

      .statItem__inside(@click.stop="")
        .statItem__chart
          StatChartLines(
            v-if="$store.getters['trns/hasTrns'] && filterPeriod !== 'all'"
            :categoryId="categoryId"
            :chartColor="category.color"
            :isShowExpenses="type === 0"
            :isShowIncomes="type === 1"
            chartType="column"
          )

        .statItem__date
          Date

        .statItem__summary
          Amount(
            :currency="currency"
            :value="total"
            :type="type"
            size="xl"
            vertical="center"
            :isColorize="false"
            isShowPrefix
          )

        template(v-if="showChildCategories")
          StatItemChildCats(
            :categoryId="categoryId"
            :type="type"
          )

        .statItem__trns
          h2 {{ $t('trns.history') }}
          TrnsList3(
            :categoryId="categoryId"
            :expenses="type === 0"
            :incomes="type === 1"
            :showCategory="showChildCategories"
            :size="5"
          )
</template>

<style lang="stylus" scoped>
@import '~assets/stylus/variables'

.categoryWrap
  flex-grow 1
  display flex
  align-items center
  justify-content center
  flex-flow column
  margin-bottom -10px

.categoryIcon
  flex-grow 1
  display flex
  align-items center
  justify-content center
  margin-top -38px
  padding-bottom 12px

.statItem
  overflow hidden
  cursor pointer
  position relative
  padding $m6
  border-radius $m6

  +media-hover()
    background var(--c-bg-3)

  .icon
    width auto
    height auto

    .icon__image
      font-size 32px

  &._active
    margin-bottom $m9

  &:active
    z-index 2
    background var(--c-bg-5)

  &__content
    display flex
    align-items center
    justify-content center
    flex-flow column

  &__inside
    cursor default

  &__trns
    padding-top $m8

    h2
      padding-bottom $m6

  &__date
    display flex
    justify-content center
    padding-top $m7
    padding-bottom $m5
    color var(--c-font-4)
    text-align center

  &__summary
    z-index 10
    position sticky
    top (- $m7)
    padding 0
    padding-bottom $m7
    background var(--c-bg-4)

  &__chart
    height 180px
    margin-bottom $m9
    // margin-left (- $m7)

  &__graph
    overflow hidden
    display none
    grid-column 2 / -1
    grid-row 2 / -1
    align-self center
    margin-top $m3
    background var(--c-bg-8)
    border-radius 2px

    &__in
      height 4px
      min-width 2px

  &__name
    // overflow hidden
    align-self center
    padding 6px 0 2px 0
    color var(--c-font-4)
    font-size 12px
    text-align center
    // white-space wrap
    // text-overflow ellipsis

    ^[0]._active &
      color var(--c-font-2)
      font-weight 500

  &__icon
    width 32px
    grid-column 1 / 2
    grid-row 1 / -1

    &:active
      opacity .8

    @media $media-laptop
      &:hover
        transform scale(1.3)

  &__amount
    align-self center
</style>
