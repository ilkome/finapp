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
      const categories = this.$store.state.categories.items
      return categories[categoryId]
    },
    values () {
      return this.$store.state.trnForm.values
    },
    wallet () {
      const walletId = this.$store.state.trnForm.values.walletId
      const wallets = this.$store.state.wallets.items
      return wallets[walletId]
    }
  }
}
</script>

<template lang="pug">
.trnFormHeader
  //- Wallet
  transition(name="fadeIn")
    template(v-if="wallet")
      .trnFormHeader__item(
        :style="{ background: wallet.color || $store.state.ui.defaultBgColor }"
        @click="$store.commit('trnForm/toogleTrnFormModal', 'wallets')")

        div
          .trnFormHeader__name {{ wallet.name }}
          .trnFormHeader__total
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

  //- Category
  template(v-if="category")
    .trnFormHeader__item(
      :style="{ background: category.color || $store.state.ui.defaultBgColor }"
      @click="$store.commit('trnForm/toogleTrnFormModal', 'categories')")

      transition(name="slide")
        .trnFormHeader__icon(v-show="true" :key="category.icon")
          Icon(
            :icon="category.icon"
          )

      .trnFormHeader__name {{ category.name }}
</template>

<style lang="stylus">
@import "~assets/stylus/variables/margins"
@import "~assets/stylus/variables/media"

.trnFormHeader
  display grid
  grid-template-columns repeat(2, 1fr)
  grid-column-gap 8px
  grid-row-gap 2px
  // padding 8px
  background var(--c-bg-4)

  @media $media-laptop
    min-height 81px

  &__item
    position relative
    display flex
    align-items center
    flex-grow 1
    padding 16px 16px
    color var(--c-bg-5)
    border-radius 0 16px 16px 0

    @media $media-laptop
      min-height 61px

    &:last-child
      border-left-color var(--c-bg-5)
      border-radius 16px 0 0 16px

  &__icon
    z-index 2

  &__total
    padding-top $m5
    .amount__wrap
      justify-content flex-start
      color var(--c-font-1)

    .amount__wrap._small
      display none

  &__name
    font-size 14px
    color var(--c-font-1)
</style>
