<script>
import firebase from 'firebase/app'

export default {
  name: 'LoginPage',

  data () {
    return {
      loading: false
    }
  },

  fetch ({ store, redirect }) {
    if (store.state.user && store.state.user.user) {
      redirect('/')
    }
  },

  methods: {
    signInWithGoogle () {
      this.loading = true
      const provider = new firebase.auth.GoogleAuthProvider()
      firebase.auth()
        .signInWithRedirect(provider)
        .catch(e => this.notifyAboutError(e))
    },

    notifyAboutError (e) {
      this.$notify({
        duration: 6000,
        text: e.message,
        title: 'Error',
        type: 'error'
      })
      this.loading = false
    },

    changeLang (lang) {
      this.$store.dispatch('lang/setLang', lang)
    }
  }
}
</script>

<template lang="pug">
.tab
  .tab__top
    .langChanger
      .langChanger__item(
        @click="changeLang('ru')"
        :class="{ _active: $store.state.lang.lang === 'ru' }"
      ) RU
      .langChanger__item(
        @click="changeLang('en')"
        :class="{ _active: $store.state.lang.lang === 'en' }"
      ) EN

    .themeChanger(@click="$store.dispatch('ui/changeTheme')") {{ $t('changeTheme') }}

  .tab__content
    AppName
    Copyright

  .tab__bottom
    .loginButton(
      :class="{ _loading: loading }"
      @click.prevent="signInWithGoogle"
    )
      transition(name="fadeIn")
        .loginButton__spiner(v-if="loading"): Spiner
      .loginButton__text {{ $t('loginWithGoogle') }}
</template>

<style lang="stylus" scoped>
@import "~assets/stylus/variables/animations"
@import "~assets/stylus/variables/fonts"
@import "~assets/stylus/variables/margins"
@import "~assets/stylus/variables/media"
@import "~assets/stylus/variables/scroll"

.tab
  overflow-x hidden
  overflow-y scroll
  position relative
  display grid
  grid-template-rows auto 1fr auto
  scrollbar()
  width 100%
  height 100%
  max-width 1000px
  margin 0 auto

  &__content
    display flex
    align-items center
    justify-content center
    flex-flow column
    padding-top 100px

  &__bottom
    display flex
    align-items center
    justify-content center
    flex-flow column
    padding $mn1

    @media $media-laptop
      padding $mb2

.langChanger
  position absolute
  top $m7
  left $m7
  display flex

  @media $media-laptop
    top $mn1
    left $m9

  &__item
    cursor pointer
    opacity .6
    padding 10px
    color var(--c-font-4)

    &._active
      color var(--c-font-1)

.themeChanger
  cursor pointer
  position absolute
  top $m7
  right $m7
  padding 10px

  @media $media-laptop
    top $mn1
    right $m9

.loginButton
  overflow hidden
  cursor pointer
  position relative
  min-width 260px
  padding $m8 $mb1
  color var(--c-font-1)
  font-size 16px
  text-align center
  background #0094FF
  border-radius 36px
  anim()

  &:hover
    background #067ab4

  &._loading
    cursor default

  &__text
    font-weight 300
    anim()

    ^[0]._loading &
      opacity 0

  &__spiner
    position absolute
    top 0
    left 0
    display flex
    align-items center
    justify-content center
    width 100%
    height 100%
</style>
