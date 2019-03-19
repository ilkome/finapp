<script>
import { formatDate } from '@/utils/formatDate'
import Amount from '@/components/amount/Amount'
import Icon from '@/components/icon/Icon'

export default {
  components: {
    Amount,
    Icon
  },

  props: {
    category: {
      type: Object,
      required: true
    },
    trn: {
      type: Object,
      required: true
    },
    trnId: {
      type: String,
      required: true
    },
    wallet: {
      type: Object,
      required: true
    },

    ui: {
      type: String,
      default: 'history'
    }
  },

  computed: {
    className () {
      return {
        _detailed: this.ui === 'detailed',
        _history: this.ui === 'history',
        _stat: this.ui === 'stat',
        _lastTrns: this.ui === 'lastTrns'
      }
    },
    formatedDate () {
      const date = formatDate(this.trn.date, 'full')
      return `${date.weekday}, ${date.day} ${date.month} ${date.year}`
    },
    formatedDateDay () {
      return formatDate(this.trn.date, 'numberDay')
    },
    formatedDateDay2 () {
      return formatDate(this.trn.date, 'trnItem')
    }
  },

  methods: {
    handleClick () {
      this.$store.commit('hideCategoryModal')
      this.$store.commit('showTrnModal')
      this.$store.commit('setTrnModalId', this.trnId)
    },

    setTrnEdit () {
      const trnId = this.trnId
      this.$store.dispatch('openTrnForm', { action: 'edit', trnId })
    }
  }
}
</script>

<template lang="pug">
.trnItem(
  v-if="category && wallet"
  @click="handleClick"
  :class="className")

  //- detailed view
  template(v-if="ui === 'detailed'")
    .trnItem__categoryIcon(@click.stop="setTrnEdit")
      Icon(
        :background="category.color"
        :icon="category.icon"
        :round="true")
    .trnItem__date {{ formatedDate }}
    .trnItem__categoryName {{ category.name }}
    .trnItem__wallet
      .walletIcon
        Icon(
          :abbr="wallet.name"
          :background="wallet.color"
          :small="true")
      .walletName {{ wallet.name }}
    .trnItem__amount(@click.stop="setTrnEdit")
      Amount(
        :currency="wallet.currency"
        :value="trn.amount"
        :type="trn.type")
    .trnItem__desc(v-if="trn.description") {{ trn.description }}

  //- stat view
  template(v-else-if="ui === 'stat'")
    .trnItem__statWrap
      .trnItem__date {{ formatedDateDay }}
      .trnItem__wallet
        .walletIcon
          Icon(
            :abbr="wallet.name"
            :background="wallet.color"
            :small="true")
        .walletName {{ wallet.name }}
      .trnItem__desc(v-if="trn.description") {{ trn.description }}
      .trnItem__amount(@click.stop="setTrnEdit")
        Amount(
          :currency="wallet.currency"
          :value="trn.amount"
          :type="trn.type")

  //- lasr trns. shows category and wallet based on active filters
  template(v-else-if="ui === 'lastTrns'")
    .trnItem__statWrap
      .trnItem__date {{ formatedDateDay2 }}

      //- category selected
      template(v-if="$store.state.filter.categoryId")
        //- category with children
        template(v-if="$store.getters.isCategoryHasChildren($store.state.filter.categoryId)")
          .trnItem__wallet
            Icon(
              :abbr="wallet.name"
              :background="wallet.color"
              :medium="true"
              :small="true")
          .trnItem__categoryIcon
            Icon(
              :background="category.color"
              :icon="category.icon"
              :medium="true"
              :round="true")
          .trnItem__categoryName {{ category.name }}
        template(v-else)
          .trnItem__wallet
            .walletIcon
              Icon(
                :abbr="wallet.name"
                :background="wallet.color"
                :small="true")
            .walletName {{ wallet.name }}

      //- wallet selected
      template(v-else-if="$store.state.filter.walletId")
        .trnItem__categoryIcon
          Icon(
            :background="category.color"
            :icon="category.icon"
            :medium="true"
            :round="true")
        .trnItem__categoryName {{ category.name }}

      //- base
      template(v-else)
        .trnItem__wallet
          Icon(
            :abbr="wallet.name"
            :background="wallet.color"
            :medium="true"
            :small="true")
        .trnItem__categoryIcon
          Icon(
            :background="category.color"
            :icon="category.icon"
            :medium="true"
            :round="true")
        .trnItem__categoryName {{ category.name }}
      .trnItem__desc(v-if="trn.description") {{ trn.description }}
      .trnItem__amount(@click.stop="setTrnEdit")
        Amount(
          :currency="wallet.currency"
          :value="trn.amount"
          :type="trn.type")

  //- history view
  template(v-else)
    .trnItem__categoryIcon(@click.stop="setTrnEdit")
      Icon(
        :background="category.color"
        :icon="category.icon"
        :round="true")
    .trnItem__categoryName {{ category.name }}
    .trnItem__walletFloatIcon
      Icon(
        :abbr="wallet.name"
        :background="wallet.color"
        :small="true")
    .trnItem__amount(@click.stop="setTrnEdit")
      Amount(
        :currency="wallet.currency"
        :value="trn.amount"
        :type="trn.type")
    .trnItem__desc(v-if="trn.description") {{ trn.description }}
    .trnItem__line
</template>

<style lang="stylus" scoped>
@import "~@/stylus/variables/margins"
@import "~@/stylus/variables/media"

.trnItem
  position relative
  color var(--c-font-4)

  &._detailed
    display grid
    grid-template-columns minmax(10px, max-content) 1fr minmax(10px, max-content)
    grid-column-gap 20px
    grid-row-gap 10px

  &._history
    display grid
    grid-template-columns minmax(10px, max-content) 1fr minmax(10px, max-content)
    grid-column-gap 28px
    padding 0 16px
    padding-top 10px
    margin-top -1px
    &:first-child
      margin-top 0

  &._stat
  &._lastTrns
    margin-top -1px
    padding-top 10px
    padding-left 68px
    padding-right 10px
    @media $media-laptop
      padding-left 62px

  &._lastTrns
    padding-left 10px

  &:hover
    &._history
    &._stat
    &._lastTrns
      @media $media-laptop
        background var(--c-bg-7)
        /.theme-light &
          background var(--c-bg-5)

  &__amount
    align-self center

    ^[0]._detailed &
      grid-column 3 / 4
      grid-row 1 / 3

    ^[0]._history &
      grid-column 3 / 4
      grid-row 1 / 2

    ^[0]._stat &
    ^[0]._lastTrns &
      margin-left auto

  &__categoryIcon
    ^[0]._detailed &
      grid-column 1 / 2
      grid-row 1 / 3
      align-self center

    ^[0]._lastTrns &
      flex 0 0 24px
      padding-right 10px

  &__categoryName
    white-space nowrap
    overflow hidden
    text-overflow ellipsis

    ^[0]._detailed &
      grid-column 2 / 3
      grid-row 2 / 3
      font-size 16px

    ^[0]._history &
      grid-column 2 / 3
      grid-row 1 / 2
      align-self center

    ^[0]._lastTrns &
      padding-right 20px

  &__date
    font-size 13px

    ^[0]._detailed &
      grid-row 1 / 2

    ^[0]._stat &
    ^[0]._lastTrns &
      padding-right 20px

    ^[0]._lastTrns &
      flex 0 0 80px

  &__desc
    color var(--c-font-2)
    font-size 14px
    white-space nowrap
    overflow hidden
    text-overflow ellipsis

    ^[0]._detailed &
      grid-column 2
      grid-row 4

    ^[0]._history &
      grid-column 2 / 4
      grid-row 2 / 3
      padding-top 5px
      padding-bottom 5px

    ^[0]._stat &
    ^[0]._lastTrns &
      padding-right 10px

  &__line
    ^[0]._history &
      grid-column 2 / 4
      grid-row 4 / 5
      padding-top 9px
      border-bottom 1px solid var(--c-bg-6)

    ^[0]._history:hover &
      @media $media-laptop
        border-color transparent

    ^[0]._history:last-child &
      border-color transparent

  &__statWrap
    display flex
    align-items center
    padding-bottom 10px
    border-bottom 1px solid var(--c-bg-6)

    ^[0]._stat:hover &
    ^[0]._lastTrns:hover &
      @media $media-laptop
        border-color transparent

    ^[0]._stat:last-child &
    ^[0]._lastTrns:last-child &
      border-color transparent

  &__wallet
    ^[0]._detailed &
    ^[0]._stat &
    ^[0]._lastTrns &
      display flex
      align-items center
      .walletIcon
        margin-right 8px
      .walletName
        font-size 14px
        white-space nowrap

    ^[0]._detailed &
      grid-column 2 / 3
      grid-row 3 / 4

    ^[0]._stat &
      padding-right 20px
    ^[0]._lastTrns &
      padding-right 20px

  &__walletFloatIcon
    position absolute
    left 35px
    top 24px
</style>
