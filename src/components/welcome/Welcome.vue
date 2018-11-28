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
.welcome
  .login__themeChanger(v-if="!showWalletForm && !showCategoryForm")
    .themeChanger(@click="$store.dispatch('changeTheme')")
      .themeChanger__icon: .mdi.mdi-palette
      .themeChanger__text Change theme

  .welcome__content
    //- wallet
    template(v-if="!showWalletForm && !$store.getters.hasWallets")
      .welcome__header
        .welcome__header__title Welcome to Finapp
        .welcome__header__desc Powerfull personal finance application
      .welcome__text Let's start with create first Wallet
      .welcome__btn
        Button._blue(
          title="Create wallet"
          v-on:onClick="showWalletForm = true")

    //- category
    template(v-else-if="!showWalletForm && !showCategoryForm && !$store.getters.hasCategories")
      .welcome__header
        .welcome__header__title Welcome to Finapp
        .welcome__header__desc Powerfull personal finance application
      .welcome__text Great! Now Let's create first category
      .welcome__btn
        Button._blue(
          title="Create category"
          v-on:onClick="showCategoryForm = true")

    transition(name="animation-tab")
      WalletForm(
        v-if="showWalletForm"
        v-on:callback="showWalletForm = false")

    transition(name="animation-tab")
      CategoryForm(
        v-if="showCategoryForm"
        v-on:callback="showCategoryForm = false")

  a(href="https://ilko.me").welcome__copy.login__copy
    | Made with
    .login__heart.mdi.mdi-heart
    | by Ilya Komichev
</template>

<style lang="stylus" scoped>
@import "~@/stylus/variables/margins"
@import "~@/stylus/variables/media"
@import "~@/stylus/variables/fonts"

.welcome
  display flex
  flex-flow column nowrap
  flex-grow 1
  align-items center
  justify-content center
  margin 0 auto
  max-width 460px
  min-height 100%

  .login__copy
    color var(--c-font-4)

  .login__heart
    opacity .8

  &__content
    display flex
    flex-flow column
    justify-content center
    flex-grow 1
    width 100%
    min-height 100%
    text-align center
    padding $m7 $m9

  &__copy
    position relative

  &__header
    padding-bottom $mb2

    &__title
      font-size 26px
      font-weight 500
      letter-spacing 1px

      @media $media-laptop
        font-size 36px
        letter-spacing 3px

    &__desc
      padding-top $m5
      font-size 12px
      color var(--c-font-4)

      @media $media-laptop
        padding-top $m7
        font-size 14px

  &__text
    padding-bottom $m9

    @media $media-laptop
      padding-bottom $m10
</style>
