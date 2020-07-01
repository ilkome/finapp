<script>
import { formatDate } from '~/utils/formatDate'

export default {
  props: {
    category: {
      type: Object,
      required: true
    },
    trn: {
      type: Object,
      required: true
    },
    id: {
      type: String,
      required: true
    },
    wallet: {
      type: Object,
      required: true
    },
    className: {
      type: Object,
      default: () => {}
    }
  },

  computed: {
    formatedDate () {
      return formatDate(this.trn.date, 'number')
    }
  }
}
</script>

<template lang="pug">
.trnItem(@click="$emit('onClick')" :class="className")

  .trnItem__date {{ formatedDate }}

  .trnItem__wallet
    .walletIcon
      Icon(
        :abbr="wallet.name"
        :background="wallet.color"
        :small="true")
    .walletName {{ wallet.name }}

  .trnItem__wallet
    .walletIcon
      Icon(
        :abbr="category.name"
        :background="category.color"
        :small="true")
    .walletName {{ category.name }}

  //- .trnItem__desc(v-if="trn.description") {{ trn.description }}

  .trnItem__amount
    Amount(
      :currency="wallet.currency"
      :value="trn.amount"
      :type="trn.type")
</template>

<style lang="stylus" scoped>
@import "~assets/stylus/variables/media"

.trnItem
  position relative
  display flex
  align-items center
  padding 10px 0
  border-bottom 1px solid var(--c-bg-6)
  color var(--c-font-4)

  &:hover
    @media $media-laptop
      margin -1px -20px 0 -20px
      padding 11px 20px 10px 20px
      background var(--c-bg-5)
      border-color transparent

      /.light-mode &
        background var(--c-bg-5)

  &:last-child
    border-color transparent

  &._selected
    margin -1px -20px 0 -20px
    padding 10px 20px 10px 20px
    background var(--c-bg-1)
    border-bottom 1px solid var(--c-bg-6)
    border-top 1px solid var(--c-bg-6)

  &__amount
    align-self center
    margin-left auto

  &__categoryName
    white-space nowrap
    overflow hidden
    text-overflow ellipsis

  &__date
    padding-right 20px
    font-size 13px

  &__desc
    overflow hidden
    padding-right 10px
    color var(--c-font-3)
    font-size 12px
    white-space nowrap
    text-overflow ellipsis

  &__wallet
    display flex
    align-items center
    padding-right 20px

    .walletIcon
      margin-right 8px

    .walletName
      font-size 14px
      white-space nowrap
</style>
