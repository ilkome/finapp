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

    insideStatCategory: {
      type: Boolean,
      default: false
    },
    fullInfo: {
      type: Boolean,
      default: false
    },
    simple: {
      type: Boolean,
      default: false
    },
    showDate: {
      type: Boolean,
      default: false
    }
  },

  computed: {
    formatedDate () {
      const date = formatDate(this.trn.date, 'full')
      return `${date.weekDay}, ${date.day} ${date.month} ${date.year}`
    },
    formatedDate2 () {
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
  :class="{ _fullInfo: fullInfo, _simple: simple, _insideStatCategory: insideStatCategory }")

  .trnItem__categoryIcon(
    @click.stop="setTrnEdit"
    v-if="!insideStatCategory")
    Icon(
      :background="category.color"
      :icon="category.icon"
      :round="true")

  .trnItem__date(v-if="showDate || fullInfo") {{ formatedDate }}

  .trnItem__categoryName
    .desc(v-if="!fullInfo") {{ formatedDate2 }}
    .desc(v-if="!insideStatCategory") {{ category.name }}
    .desc(v-if="!fullInfo && trn.description") {{ trn.description }}

  .trnItem__wallet
    .trnItem__wallet__icon(@click.stop="setTrnEdit")
      Icon(
        :abbr="wallet.name"
        :background="wallet.color"
        :small="true")
    .trnItem__wallet__name {{ wallet.name }}

  .trnItem__amount
    Amount(
      :currency="wallet.currency"
      :value="trn.amount"
      :type="trn.type")

  .trnItem__desc(v-if="fullInfo && trn.description") {{ trn.description }}
  .trnItem__line
</template>

<style lang="stylus" scoped>
@import "~@/stylus/variables/margins"
@import "~@/stylus/variables/media"

.trnItem
  position relative
  display grid
  padding 0 $m7
  padding-top $m6
  margin-top -1px
  grid-template-columns minmax(10px, max-content) 1fr minmax(10px, max-content)
  grid-column-gap $m9
  color var(--c-font-4)

  &:first-child
    margin-top 0

  &._simple
    padding 0 $m8

  &._insideStatCategory
    padding $m7 $m7
    grid-template-columns minmax(20px, 38px) 1fr minmax(10px, max-content)
    border-bottom 1px solid var(--c-bg-3)

    /.theme-light &
      border-bottom 1px solid var(--c-bg-1)

    @media $media-laptop
      padding $m6 $m8
      border 0

  &:active
    background var(--c-bg-7)

  &:hover
    @media $media-laptop
      background var(--c-bg-7)

      /.theme-light &
        background var(--c-bg-5)

  &._fullInfo
  &._insideStatCategory
    grid-column-gap $m8
    grid-row-gap $m5

  &__amount
    grid-column 3 / 4
    grid-row 1 / 3
    align-self center

    ^[0]._insideStatCategory &
      grid-row 1 / 2

  &__date
    grid-row 1 / 2
    align-self center
    font-size 12px

  &__desc
    grid-column 2 / 4
    grid-row 3 / 4
    padding-bottom $m6
    font-size 12px

    ^[0]._fullInfo &
      grid-row 4 / 5
      padding-top $m6
      padding-bottom 0

  &__categoryIcon
    grid-column 1 / 2
    grid-row 1 / 3

    @media $media-laptop
      margin $m4 0

  &__categoryName
    grid-column 2 / 3
    grid-row 1 / 3
    align-self center
    white-space nowrap
    overflow hidden
    text-overflow ellipsis

    ^[0]._fullInfo &
      grid-row 2 / 3
      align-self flex-start

    ^[0]._insideStatCategory &
      grid-column 1 / 2
      grid-row 1 / 2

    .desc
      display inline-block
      padding-right $m7
      font-size 14px

  &__line
    grid-column 2 / 4
    grid-row 4 / 5
    padding-bottom $m6
    border-bottom 1px solid var(--c-bg-6)

    ^[0]:hover &
      @media $media-laptop
        border-color transparent

    ^[0]:last-child &
      border-color transparent

    ^[0]._fullInfo &
    ^[0]._insideStatCategory &
      display none

  &__name
    display none
    margin-top 2px
    font-size 14px
    line-height 14px

    @media $media-laptop
      display block
      font-size 13px

  &__wallet
    grid-column 2 / 3
    grid-row 2 / 3
    display flex
    align-items center

    @media $media-laptop
      padding-top $m5

    ^[0]._fullInfo &
      grid-column 2 / 3
      grid-row 3 / 4
      display flex
      align-items center

      @media $media-laptop
        padding-top 0

    ^[0]._insideStatCategory &
      grid-column 2 / 3
      grid-row 1 / 2
      padding 0

    &__name
      display none

      ^[0]._fullInfo &
      ^[0]._insideStatCategory &
        display block
        margin-left $m5
        font-size 14px

    &__icon
      position absolute
      left $m10
      top $m9

      ^[0]._simple &
        left $m10

      ^[0]._fullInfo &
      ^[0]._insideStatCategory &
        position relative
        left 0
        top 0

        .icon
          width 18px
          height 18px

        .icon .icon__abbr
          font-size 10px
</style>
