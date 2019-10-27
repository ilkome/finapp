<script>
import Button from '@/components/shared/button/Button'
import CategoryForm from '@/components/categories/form/CategoryForm'
import Copyright from '@/components/shared/copyright/Copyright'
import WalletForm from '@/components/wallets/form/WalletForm'
import ThemeSelector from '@/components/welcome/ThemeSelector'
import LangSelector from '@/components/welcome/LangSelector'

export default {
  components: {
    Button,
    CategoryForm,
    Copyright,
    LangSelector,
    ThemeSelector,
    WalletForm
  },

  data () {
    return {
      step: 0,
      showCategoryForm: false,
      showWalletForm: false
    }
  },

  methods: {
    categoryCreatedCallback () {
      this.showCategoryForm = false
      this.$store.dispatch('setActiveTab', 'stat')
    }
  }
}
</script>

<template lang="pug">
.tabs
  //- welcome
  transition(name="fadeInSlow")
    template(v-if="step === 0")
      .tab
        .tab__content
          .header
            .header__title {{ $lang.app.welcome }}
            .header__desc {{ $lang.app.desc }}
            .header__user(@click="$store.dispatch('signOut')") Logout {{ $store.state.user.user.email }}
          .options
            .options__item
              .options__desc {{ $lang.app.lang.select }}
              LangSelector
              .options__desc {{ $lang.app.theme.select }}
              ThemeSelector
              Button._blue(
                :title="$lang.buttons.nextStep"
                v-on:onClick="step = 1")

  transition(name="fadeInSlow")
    template(v-if="step === 1")
      .tab
        .tab__content
          .header(@click="$store.dispatch('changeTheme')")
            .header__title {{ $lang.app.welcome }}
            .header__desc {{ $lang.app.desc }}
            .header__user(@click="$store.dispatch('signOut')") Logout {{ $store.state.user.user.email }}
          .options
            .options__item
              .options__desc {{ $lang.welcome.create.text }}
              Button._blue(
                :title="$lang.welcome.create.btn"
                v-on:onClick="step = 2")

            template(v-if="$store.state.demo.hasDemo")
              .options__or
                .options__or__border
                .options__or__text {{ $lang.welcome.or }}
              .options__item
                .options__desc {{ $lang.welcome.demo.text }}
                Button._grey._center(
                  :title="$lang.welcome.demo.btn"
                  v-on:onClick="$store.dispatch('createDemo')")

  //- wallet
  transition(name="fadeInSlow")
    template(v-if="(step !== 0 && step !== 1) && !showWalletForm && !$store.getters.hasWallets")
      .tab
        .tab__content
          .tab__wrap
            .header
              .header__title {{ $lang.app.welcome }}
              .header__desc {{ $lang.app.desc }}
              .header__user(@click="$store.dispatch('signOut')") Logout {{ $store.state.user.user.email }}
            .text {{ $lang.welcome.createFirstWallet.text }}
            .button
              Button._blue(
                :title="$lang.welcome.createFirstWallet.btn"
                v-on:onClick="showWalletForm = true")

  //- category
  transition(name="fadeInSlow")
    template(v-if="!showWalletForm && !showCategoryForm && $store.getters.hasWallets && !$store.getters.hasCategories")
      .tab
        .tab__content
          .icon: .mdi.mdi-chart-bubble
          .text {{ $lang.welcome.createFirstCategory.text }}
          .button
            Button._blue(
              :title="$lang.welcome.createFirstCategory.btn"
              v-on:onClick="showCategoryForm = true")

  transition(name="fadeInSlow")
    .tab(v-if="showWalletForm")
      .tab__content
        WalletForm(v-on:callback="showWalletForm = false")

  transition(name="fadeInSlow")
    .tab(v-if="showCategoryForm")
      .tab__content
        CategoryForm(v-on:callback="categoryCreatedCallback")

  .copyright
    Copyright
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

    @media $media-laptop
      width 400px

    .component
      padding 0

.header
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

  &__user
    cursor pointer
    padding-top $m5
    font-size 12px

    @media $media-laptop
      padding-top $m7
      font-size 14px

.options
  &__or
    display flex
    align-items center
    justify-content center
    position relative
    padding $m9 0
    text-align center
    color var(--c-font-4)
    &__text
      position relative
      padding $m7
      background var(--c-bg-1)
    &__border
      position absolute
      left 0
      top 50%
      width 100%
      height 1px
      background var(--c-bg-6)

  &__desc
    padding-bottom $m7
    color var(--c-font-4)
    line-height 20px

.text
  line-height 20px
  padding-bottom $m8
  @media $media-laptop
    padding-bottom $m9

.icon
  padding-bottom $m5
  text-align center
  color var(--c-font-4)
  font-size 96px
  @media $media-laptop
    padding-bottom $m7

.copyright
  position fixed
  left 0
  bottom 0
  width 100%
  padding-bottom $m7
  background var(--c-bg-1)

  @media $media-laptop
    padding-bottom $m9
</style>
