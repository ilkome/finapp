<script>
import Button from '@/components/shared/button/Button'
import CategoryForm from '@/components/categories/form/CategoryForm'
import WalletForm from '@/components/wallets/form/WalletForm'

export default {
  components: {
    Button,
    CategoryForm,
    WalletForm
  },

  data () {
    return {
      showCategoryForm: false,
      showWalletForm: false
    }
  }
}
</script>

<template lang="pug">
.tabs
  //- wallet
  transition(name="fadeInSlow")
    template(v-if="!showWalletForm && !$store.getters.hasWallets")
      .tab
        .tab__content
          .welcome__header
            .welcome__header__title Welcome to Finapp
            .welcome__header__desc Powerfull personal finance application
          .welcome__text Let's start with create first Wallet
          .welcome__btn
            Button._blue(
              title="Create wallet"
              v-on:onClick="showWalletForm = true")

  //- category
  transition(name="fadeInSlow")
    template(v-if="!showWalletForm && !showCategoryForm && $store.getters.hasWallets && !$store.getters.hasCategories")
      .tab
        .tab__content
          .welcome__icon: .mdi.mdi-chart-bubble
          .welcome__text Great! Now Let's create first category
          .welcome__btn
            Button._blue(
              title="Create category"
              v-on:onClick="showCategoryForm = true")

  transition(name="fadeInSlow")
    .tab(v-if="showWalletForm")
      .tab__content
        WalletForm(
          v-on:callback="showWalletForm = false")

  transition(name="fadeInSlow")
    .tab(v-if="showCategoryForm")
      .tab__content
        CategoryForm(
          v-on:callback="showCategoryForm = false")

  a(href="https://ilko.me").welcome__copy.login__copy
    | Made with
    .login__heart.mdi.mdi-heart
    | by Ilya Komichev
</template>

<style lang="stylus" scoped>
@import "~@/stylus/variables/margins"
@import "~@/stylus/variables/flex"
@import "~@/stylus/variables/media"
@import "~@/stylus/variables/fonts"
@import "~@/stylus/variables/scrollbar"

.tabs
  overflow hidden
  position absolute
  width 100%
  height 100%

.tab
  display grid
  overflow-x hidden
  overflow-y scroll
  scrollbar()
  position absolute
  left 0
  top 0
  width 100%
  height 100%
  padding-bottom $m10

  &__content
    display-flex(column, grow)
    align-self center
    margin 0 auto
    padding $m9
    padding-bottom 100px

    .component
      padding 0

.welcome

  .login__copy
    color var(--c-font-4)

  .login__heart
    opacity .8

  &__themeChanger
    padding-top $m9

  &__copy
    margin 0
    padding $m9 0
    bottom 0
    background var(--c-bg-1)

  &__header
    padding-bottom $mb2

    &__title
      font-size 28px
      font-weight 500
      letter-spacing 1px

      @media $media-laptop
        font-size 28px
        letter-spacing 3px

    &__desc
      padding-top $m5
      font-size 12px
      color var(--c-font-4)

      @media $media-laptop
        padding-top $m7
        font-size 14px

  &__icon
    padding-bottom $m5
    text-align center
    color var(--c-font-4)
    font-size 96px

    @media $media-laptop
      padding-bottom $m7

  &__text
    padding-bottom $m9

    @media $media-laptop
      padding-bottom $m10
</style>
