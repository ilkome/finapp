<script>
import Amount from '~/components/amount/Amount'
import Icon from '~/components/icon/Icon'
import TrnsList from '~/components/trns/list/TrnsList'
import StatItemChildCats from '~/components/stat/StatItemChildCats'

export default {
  components: {
    Amount,
    Icon,
    StatItemChildCats,
    TrnsList
  },

  props: {
    category: {
      type: Object,
      required: true
    },
    categoryId: {
      type: String,
      required: true
    },
    total: {
      type: Number,
      required: true
    },
    type: {
      type: Number,
      required: true
    },
    biggest: {
      type: Number,
      required: true
    }
  },

  data () {
    return {
      showTrns: false
    }
  },

  computed: {
    styles () {
      return {
        width: `${Math.abs(this.total) / Math.abs(this.biggest) * 100}%`,
        background: this.category.color
      }
    }
  },

  methods: {
    toogleShowTrnsInCategory (categoryId) {
      this.showTrns = !this.showTrns
    }
  }
}
</script>

<template lang="pug">
.statItemChild(
  @click="toogleShowTrnsInCategory(categoryId)"
  :class="{ _active: showTrns }")

  .statItemChild__content
    .statItemChild__graph: .statItemChild__graph__in(:style="styles")

    .statItemChild__icon(
      @click.stop="() => $store.dispatch('filter/handleSetFilterCategory', categoryId)")
      Icon(
        :background="category.color"
        :icon="category.icon"
        :round="true")

    .statItemChild__name {{ category.name }}

    .statItemChild__amount
      Amount(
        :currency="$store.state.currencies.base"
        :value="total")

  .statItemChild__trns(@click.stop="" v-if="showTrns")
    TrnsList(
      ui="stat"
      :incomes="type === 1"
      :expenses="type === 0"
      :categoryId="categoryId")
</template>

<style lang="stylus" scoped>
@import "~assets/stylus/variables/margins"
@import "~assets/stylus/variables/fonts"
@import "~assets/stylus/variables/media"
@import "~assets/stylus/variables/scroll"

.statItemChild
  border-bottom 1px solid var(--c-bg-5)
  &:last-child
    border 0

  &__content
    display grid
    grid-template-columns minmax(10px, max-content) 1fr minmax(10px, max-content)
    grid-template-rows repeat(2, minmax(10px, max-content))
    grid-column-gap 20px
    padding 10px 10px

  &__graph
    overflow hidden
    grid-column 2 / -1
    grid-row 2 / -1
    align-self center
    margin-top 6px
    background var(--c-bg-6)
    border-radius 2px

    &__in
      height 4px
      min-width 2px

  &__name
    overflow hidden
    align-self center
    color var(--c-font-4)
    font-size 16px
    white-space nowrap
    text-overflow ellipsis

  &__icon
    display flex
    justify-content center
    width 32px
    grid-column 1 / 2
    grid-row 1 / -1

  &__amount
    align-self center
</style>
