<script>
import Amount from '@/components/amount/Amount'
import Icon from '@/components/icon/Icon'

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
    },
    showIcon () {
      for (const modal in this.$store.state.trnForm.modal) {
        if (this.$store.state.trnForm.modal[modal]) {
          return false
        }
      }
      return true
    }
  }
}
</script>

<template lang="pug">
.trnFormHeader
  //- Wallet
  template(v-if="wallet")
    .trnFormHeader__item(
      :style="{ background: wallet.color || $store.state.ui.defaultBgColor }"
      @click="$store.commit('toogleTrnFormModal', 'wallets')"
    )
      transition(name="slide")
        .trnFormHeader__icon(v-show="showIcon")
          Icon(
            :big="true"
            :color="wallet.color || $store.state.ui.defaultBgColor"
            :invert="true"
            icon="mdi mdi-credit-card-multiple"
          )
      div
        .trnFormHeader__name {{ wallet.name }}
        .trnFormHeader__total
          template(v-if="$store.getters.walletsTotal[values.walletId]")
            Amount(
              :value="$store.getters.walletsTotal[values.walletId].base"
              :currency="wallet.currency")
          template(v-else)
            Amount(
              :value="0"
              :currency="$store.state.currencies.base"
            )

  //- Category
  template(v-if="category")
    .trnFormHeader__item(
      :style="{ background: category.color || $store.state.ui.defaultBgColor }"
      @click="$store.commit('toogleTrnFormModal', 'categories')"
    )
      transition(name="slide")
        .trnFormHeader__icon(v-show="showIcon")
          Icon(
            :big="true"
            :color="category.color || $store.state.ui.defaultBgColor"
            :icon="category.icon"
            :invert="true"
            :round="true"
          )
      .trnFormHeader__name {{ category.name }}
</template>

<style lang="stylus" scoped>
@import "~@/stylus/variables/margins"
@import "~@/stylus/variables/media"

.trnFormHeader
  display flex
  justify-content space-between
  min-height 75px
  background var(--c-bg-8)

  @media $media-laptop
    min-height 81px

  &__item
    position relative
    display flex
    align-items center
    flex-grow 1
    width 50%
    padding $m8 $m8
    color var(--c-bg-5)

    @media $media-laptop
      min-height 81px

    &:last-child
      border-left-color var(--c-bg-5)

  &__icon
    z-index 2
    position absolute
    right $m7
    top - (48/2)px

  &__total
    padding-top $m5

  &__name
    font-size 18px
    color var(--c-font-1)

  &__transfer
    display flex
    align-items center
    justify-content center
    padding 0 $m6
    font-size 22px
    border 1px solid var(--c-bg-5)
    border-right-color transparent
    border-top-color transparent
</style>

<style lang="stylus">
.trnFormHeader__total
  .amount__wrap
    justify-content flex-start
    color var(--c-font-1)

  .amount__wrap._small
    display none
</style>
