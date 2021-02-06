<script>
import { formatDate } from '~/utils/formatDate'

export default {
  name: 'TrnItemForm',

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
    }
  },

  computed: {
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
    setTrnEdit () {
      const trnId = this.trnId
      this.$store.commit('trnForm/setTrnFormModalTrnId', trnId)

      if (this.trnId === this.$store.state.trnForm.values.trnId) {
        this.$store.commit('trnForm/setTrnFormValues', { trnId: null, amountEvaluation: null, amount: '0' })
      }
      else {
        this.$store.dispatch('trnForm/openTrnForm', { action: 'edit', trnId })
        if (this.$listeners.onClickValue) {
          this.$emit('onClickValue')
        }
      }
    }
  }
}
</script>

<template lang="pug">
.trnItem._lastTrns(
  :class="{ _active: $store.state.trnForm.values.trnId === trnId }"
  v-if="category && wallet"
  @click="setTrnEdit"
)
  .trnItem__statWrap
    .trnItem__date {{ formatedDateDay2 }}
    //- base
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
    .trnItem__amount
      Amount(
        :currency="wallet.currency"
        :value="trn.amount"
        :type="trn.type"
      )
</template>

<style lang="stylus" scoped>
@import "~assets/stylus/variables/margins"
@import "~assets/stylus/variables/media"

.trnItem
  position relative
  margin-top -1px
  padding-top 10px
  padding-right $m9
  padding-left $m9
  color var(--c-font-4)

  &._active
    background var(--c-bg-1)

  &:hover
    &._history
    &._stat
    &._lastTrns
      @media $media-laptop
        background var(--c-bg-5)

        /.light-mode &
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
    padding-right 10px
    flex 0 0 80px

  &__desc
    color var(--c-font-2)
    font-size 14px

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
      white-space nowrap
      overflow hidden
      text-overflow ellipsis

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

  &__groups
  &__budgest
    display inline-block
    padding-left 10px
    font-size 10px
</style>
