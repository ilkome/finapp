<script>
import Amount from '~/components/amount/Amount'
import Icon from '~/components/icon/Icon'

export default {
  components: {
    Amount,
    Icon
  },

  computed: {
    category () {
      const categoryId = this.$store.state.trnForm.values.categoryId
      return this.$store.state.categories.items[categoryId]
    },

    parentCategory () {
      return this.$store.state.categories.items[this.category.parentId]
    },

    values () {
      return this.$store.state.trnForm.values
    },

    wallet () {
      const walletId = this.$store.state.trnForm.values.walletId
      return this.$store.state.wallets.items[walletId]
    }
  }
}
</script>

<template lang="pug">
.trnFormHeader
  //- wallet
  transition(name="fadeIn")
    template(v-if="wallet")
      .trnFormHeaderItem(
        :style="{ background: wallet.color || $store.state.ui.defaultBgColor }"
        @click="$store.commit('trnForm/toogleTrnFormModal', 'wallets')"
      )
        .trnFormHeaderItem__in
          .trnFormHeaderItem__name {{ wallet.name }}
          .trnFormHeaderItem__total
            template(v-if="$store.getters['wallets/walletsTotal'][values.walletId]")
              Amount(
                :value="$store.getters['wallets/walletsTotal'][values.walletId].base"
                :currency="wallet.currency"
                vertical="left"
              )
            template(v-else)
              Amount(
                :value="0"
                :currency="$store.state.currencies.base"
                vertical="left"
            )
        .trnFormHeaderItem__dots: .mdi.mdi-dots-vertical

  //- category
  template(v-if="category")
    .trnFormHeaderItem._category(
      :style="{ background: category.color || $store.state.ui.defaultBgColor }"
      @click="$store.commit('trnForm/toogleTrnFormModal', 'categories')"
    )
      .trnFormHeaderItem__in
        transition(name="slide")
          .trnFormHeaderItem__icon(
            v-show="true"
            :key="category.icon"
          )
            Icon(:icon="category.icon")
        .trnFormHeaderItem__name
          .parent(v-if="parentCategory") {{ parentCategory.name }}
          .child {{ category.name }}
      .trnFormHeaderItem__dots: .mdi.mdi-dots-vertical
</template>

<style lang="stylus">
@import "~assets/stylus/variables/margins"
@import "~assets/stylus/variables/media"

.trnFormHeader
  display grid
  grid-template-columns repeat(2, 1fr)
  // grid-column-gap 1px
  // padding 16px
  background var(--c-bg-4)

  @media $media-phone
    // padding-bottom $m5

  @media $media-laptop
    // padding-top 8px
    // min-height 81px

  /.theme-light &
    background var(--c-bg-2)

.trnFormHeaderItem
  position relative
  flex-grow 1
  padding $m7 $m7
  color var(--c-bg-5)
  // border-radius $m6 $m6 0 0

  @media $media-laptop
    min-height 61px

  &__in
    ~/._category &
      display flex
      align-items center

  &__icon
    z-index 2
    margin-left -8px
    padding-right 4px

  &__total
    padding-top $m5

  &__name
    color var(--c-font-1)

    .parent
      font-size 12px
      padding-bottom $m2

    .child
      font-size 16px

  &__dots
    position absolute
    top $m6
    right $m4
    color var(--c-font-2)
    font-size 16px
</style>
