<script>
export default {
  name: 'WelcomePage',

  data () {
    return {
      step: 1,
      showCategoryForm: false,
      showWalletForm: false
    }
  },

  computed: {
    newUserData () {
      if (!this.$store.getters['wallets/hasWallets'] || !this.$store.getters['categories/hasCategories']) {
        return true
      }
      return false
    }
  },

  watch: {
    newUserData (newUserData) {
      if (!newUserData) {
        this.$router.push('/')
      }
    }
  },

  mounted () {
    if (!this.newUserData) {
      this.$router.push('/')
    }

    if (!this.$store.state.user.user) {
      this.$store.dispatch('user/signOut')
    }
  },

  methods: {
    categoryCreatedCallback () {
      this.showCategoryForm = false
      this.$store.dispatch('ui/setActiveTab', 'stat')
    },

    changeLang (lang) {
      this.$store.dispatch('lang/setLang', lang)
    }
  }
}
</script>

<template lang="pug">
.tabs(v-if="newUserData && $store.state.user.user")

  //- welcome
  transition(name="fadeIn")
    template(v-if="step === 1")
      .tab
        .tab__content
          .header
            .header__title {{ $t('app.welcome') }}
            .header__desc {{ $t('app.desc') }}
            .header__user(@click="$store.dispatch('user/signOut')") {{ $t('userLogout') }} {{ $store.state.user.user.email }}

          .options
            .options__item
              .options__desc {{ $t('app.lang.select') }}
              .themeSelector
                .themeSelector__item(
                  :class="{ _active: $store.state.lang.lang === 'ru' }"
                  @click="changeLang('ru')"
                ) {{ $t('app.lang.ru') }}

                .themeSelector__item(
                  :class="{ _active: $store.state.lang.lang === 'en' }"
                  @click="changeLang('en')"
                ) {{ $t('app.lang.en') }}
              .options__desc {{ $t('app.theme.select') }}

              .themeSelector
                .themeSelector__item._dark(
                  :class="{ _active: $colorMode.value === 'dark' }"
                  @click="$store.dispatch('ui/changeTheme', 'dark')"
                )
                  .themeSelector__icon
                    template(v-if="$colorMode.value === 'dark'")
                      .mdi.mdi-lightbulb-on
                    template(v-else)
                      .mdi.mdi-lightbulb-outline
                  .themeSelector__title {{ $t('app.theme.dark') }}

                .themeSelector__item._light(
                  :class="{ _active: $colorMode.value === 'light' }"
                  @click="$store.dispatch('ui/changeTheme', 'light')"
                )
                  .themeSelector__icon
                    template(v-if="$colorMode.value === 'light'")
                      .mdi.mdi-lightbulb-on
                    template(v-else)
                      .mdi.mdi-lightbulb-outline
                  .themeSelector__title {{ $t('app.theme.light') }}

              Button._blue._center(
                :title="$t('buttons.nextStep')"
                @onClick="step = 2")

  transition(name="fadeIn")
    template(v-if="step === 2")
      .tab
        .tab__content
          .header
            .header__title {{ $t('app.welcome') }}
            .header__desc {{ $t('app.desc') }}
            .header__user(@click="$store.dispatch('user/signOut')") {{ $t('userLogout') }} {{ $store.state.user.user.email }}

          .options
            .options__item
              .options__desc {{ $t('welcome.create.text') }}
              Button._blue._center(
                :title="$t('welcome.create.btn')"
                @onClick="step = 3")

            template(v-if="$store.state.demo.hasDemo")
              .options__or
                .options__or__border
                .options__or__text {{ $t('welcome.or') }}
              .options__item
                .options__desc {{ $t('welcome.demo.text') }}
                Button._grey._center(
                  :title="$t('welcome.demo.btn')"
                  @onClick="$store.dispatch('demo/createDemo')")

  //- wallet
  transition(name="fadeIn")
    template(v-if="(step !== 1 && step !== 2) && !showWalletForm && !$store.getters['wallets/hasWallets']")
      .tab
        .tab__content
          .tab__wrap
            .header
              .header__title {{ $t('app.welcome') }}
              .header__desc {{ $t('app.desc') }}
              .header__user(@click="$store.dispatch('user/signOut')") {{ $t('userLogout') }} {{ $store.state.user.user.email }}

            .text {{ $t('welcome.createFirstWallet.text') }}
            .button
              Button._blue._center(
                :title="$t('welcome.createFirstWallet.btn')"
                @onClick="showWalletForm = true")

  //- category
  transition(name="fadeIn")
    template(v-if="(step !== 1 && step !== 2) && !showWalletForm && !showCategoryForm && $store.getters['wallets/hasWallets'] && !$store.getters['categories/hasCategories']")
      .tab
        .tab__content
          .icon: .mdi.mdi-folder-star
          .text {{ $t('welcome.createFirstCategory.text') }}
          .button
            Button._blue._center(
              :title="$t('welcome.createFirstCategory.btn')"
              @onClick="showCategoryForm = true")

  transition(name="fadeIn")
    .tab(v-if="showWalletForm")
      .tab__content
        WalletForm(@callback="showWalletForm = false")

  transition(name="fadeIn")
    .tab(v-if="showCategoryForm")
      .tab__content
        CategoryForm(@callback="categoryCreatedCallback")

  .copyright
    Copyright
</template>

<style lang="stylus" scoped>
@import '~assets/stylus/variables/margins'
@import '~assets/stylus/variables/flex'
@import '~assets/stylus/variables/media'
@import '~assets/stylus/variables/fonts'
@import '~assets/stylus/variables/scroll'

.steps
  display flex
  width 100%
  padding-bottom $m10
  border-radius $m4

.stepItem
  flex-grow 1
  padding $m6
  text-align center
  background var(--c-bg-2)

  &._active
    background var(--c-bg-5)
    border-radius $m4

.tabs
  overflow hidden
  position absolute
  width 100%
  height 100%
  background var(--c-bg-3)

.tab
  position absolute
  top 0
  left 0
  display grid
  width 100%
  height 100%
  padding-bottom $m10
  overflow-x hidden
  overflow-y scroll
  scrollbar()

  &__content
    display-flex(column, grow)
    margin 0 auto
    padding $m9
    padding-bottom 100px
    align-self center

    @media $media-laptop
      width 550px

    .component
      padding 0

.header
  padding-bottom $m9

  &__title
    font-size 28px
    font-weight 500
    letter-spacing 1px

  &__desc
    padding-top $m6
    color var(--c-font-4)
    font-size 12px

    @media $media-laptop
      padding-top $m6
      font-size 14px

  &__user
    cursor pointer
    padding-top $m7
    font-size 12px

    @media $media-laptop
      padding-top $m7
      font-size 14px

.options
  &__or
    position relative
    display flex
    align-items center
    justify-content center
    padding $m9 0
    color var(--c-font-4)
    text-align center
    &__text
      position relative
      padding $m7
      background var(--c-bg-3)
    &__border
      position absolute
      top 50%
      left 0
      width 100%
      height 1px
      background var(--c-bg-6)

  &__desc
    padding-bottom $m7
    color var(--c-font-4)
    line-height 20px

.text
  padding-bottom $m8
  line-height 20px
  @media $media-laptop
    padding-bottom $m9

.icon
  padding-bottom $m5
  color var(--c-font-4)
  font-size 96px
  text-align center
  @media $media-laptop
    padding-bottom $m7

.copyright
  position fixed
  left 0
  bottom 0
  width 100%
  padding-bottom $m7
  background var(--c-bg-3)

  @media $media-laptop
    padding-bottom $m9

.themeSelector
  position relative
  display grid
  grid-template-columns 1fr 1fr
  grid-column-gap 40px
  padding-bottom $m10

  &__item
    flex-grow 1
    cursor pointer
    padding 25px 30px
    text-align center
    border 1px solid rgba(63, 63, 63, 1)
    border-radius 3px

    &._dark
      color rgba(150, 150, 150, 1)
      background rgba(10, 10, 10, 1)
      border-color rgba(63, 63, 63, 1)

    &._light
      color rgba(50, 50, 50, 1)
      background rgba(229, 229, 229, 1)
      border-color rgba(190, 190, 190, 1)

    &._active
      border-color rgba(44, 173, 34, 1)

  &__icon
    opacity .5
    padding-bottom 20px
    font-size 32px

    .themeSelector__item._active &
      opacity 1
      color rgba(44, 173, 34, 1)
</style>
