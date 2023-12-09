<script lang="ts">
export default {
  data() {
    return {
      step: 1,
      showCategoryForm: false,
      showWalletForm: false,
    }
  },

  computed: {
    newUserData() {
      return !this.$store.getters['wallets/hasWallets'] || !this.$store.getters['categories/hasCategories']
    },
  },

  watch: {
    newUserData(newUserData) {
      if (!newUserData)
        this.$router.push('/')
    },
  },

  mounted() {
    if (!this.newUserData)
      this.$router.push('/')

    if (!this.$store.state.user.user)
      this.$store.dispatch('user/signOut')
  },

  methods: {
    changeLang(lang) {
      this.$store.dispatch('lang/setLang', lang)
    },
  },
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

              .flex-center
                UiButtonBlue(
                  maxWidth
                  @click="step = 2"
                ) {{ $t('buttons.nextStep') }}

  //-
  transition(name="fadeIn")
    template(v-if="step === 2")
      .tab
        .tab__content
          .header
            .header__title
              template(v-if="step === 1") {{ $t('app.welcome') }}
              template(v-else) {{ $t('appName') }}

            .header__desc(v-if="step === 1") {{ $t('app.desc') }}
            .header__user(
              v-if="step === 1"
              @click="$store.dispatch('user/signOut')"
            ) {{ $t('userLogout') }} {{ $store.state.user.user.email }}

          .options
            .options__item
              .options__desc {{ $t('welcome.create.text') }}
              .flex-center
                UiButtonBlue(
                  v-if="!$store.getters['wallets/hasWallets']"
                  maxWidth
                  @click="() => { step = 3; showWalletForm = true; }"
                ) {{ $t('wallets.createNewTitle') }}

                UiButtonBlue(
                  v-if="$store.getters['wallets/hasWallets']"
                  maxWidth
                  @click="() => { step = 3; showCategoryForm = true; }"
                ) {{ $t('categories.createNewTitle') }}

  //- Wallet form
  transition(name="fadeIn")
    .h-full.mx-auto.md_max-w-xl(v-if="showWalletForm")
      WelcomeWalletForm(
        @afterSave="showWalletForm = false"
      )

  //- Category
  transition(name="fadeIn")
    template(v-if="(step !== 1 && step !== 2) && !showWalletForm && !showCategoryForm && $store.getters['wallets/hasWallets'] && !$store.getters['categories/hasCategories']")
      .tab
        .tab__content
          .icon: .mdi.mdi-folder-star
          .options__desc {{ $t('welcome.createFirstCategory.text') }}
          .flex-center
            UiButtonBlue(
              maxWidth
              @click="showCategoryForm = true"
            ) {{ $t('welcome.createFirstCategory.btn') }}

  //- Category form
  transition(name="fadeIn")
    .h-full.mx-auto.md_max-w-xl(v-if="showCategoryForm")
      WelcomeCategoryForm(
        v-if="showCategoryForm"
        @afterSave="showCategoryForm = false"
      )

  .firefoxBackdropFix.z-10.w-full.fixed.left-0.bottom-0.backdrop-blur(
    class="bg-layout-main/70"
  )
    CommonCopyright
</template>

<style lang="stylus" scoped>
.tabs
  overflow hidden
  position absolute
  width 100%
  height 100%

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
    width 100%
    flex-grow 1
    display flex
    flex-flow column
    padding $m9
    padding-bottom 100px
    align-self center
    justify-self center

    +media(600px)
      width 550px

    .component
      padding 0

.header
  padding-bottom $mb1

  &__title
    padding-bottom $m8
    font-size 28px
    font-weight 500
    letter-spacing 1px
    text-align center

  &__desc
    padding-bottom $m5
    color var(--c-font-4)
    font-size 12px
    text-align center

    @media $media-laptop
      font-size 14px

  &__user
    cursor pointer
    padding-top $m9
    font-size 12px
    text-align center

    @media $media-laptop
      padding-top $m9
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

    &__border
      position absolute
      top 50%
      left 0
      width 100%
      height 1px
      background var(--c-bg-6)

  &__desc
    @apply pb-6;
    color var(--c-font-4)
    line-height 20px
    text-align center

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

.themeSelector
  position relative
  display grid
  grid-template-columns 1fr 1fr
  grid-column-gap 40px
  padding-bottom $m10

  &__item
    flex-grow 1
    cursor pointer
    padding 16px 16px
    text-align center
    border 1px solid rgba(63, 63, 63, 1)
    border-radius 8px

    &._dark
      border-color rgba(63, 63, 63, 1)

    &._light
      border-color rgba(190, 190, 190, 1)

    &._active
      border 1px solid var(--c-blue-3)

  &__icon
    opacity .5
    padding-bottom 20px
    font-size 32px

    .themeSelector__item._active &
      opacity 1
      color var(--c-blue-3)
</style>
