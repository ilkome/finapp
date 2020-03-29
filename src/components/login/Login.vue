<script>
import { auth } from 'firebase/app'
import AppName from '@/components/shared/appName/AppName'
import Button from '@/components/shared/button/Button'
import Copyright from '@/components/shared/copyright/Copyright'
import Spiner from '@/components/shared/spiner/Spiner'

export default {
  components: {
    AppName,
    Button,
    Copyright,
    Spiner
  },

  data: () => ({
    error: null,
    loading: {
      google: false,
      demo: false
    }
  }),

  methods: {
    signInWithGoogle () {
      this.error = null
      this.loading.google = true
      const provider = new auth.GoogleAuthProvider()
      auth().signInWithRedirect(provider)
        .catch(e => this.notifyAboutError(e, 'google'))
    },

    notifyAboutError (e, loginType) {
      this.$notify({
        group: 'main',
        title: 'Error',
        text: e.message,
        type: 'error'
      })
      this.error = e.message
      this.loading[loginType] = false
      console.log(e)
    },

    changeLang (lang) {
      this.$store.dispatch('setLang', lang)
      this.$setLang(lang)
    }
  }
}
</script>

<template lang="pug">
.tab
  .langChanger
    .langChanger__item(@click="changeLang('ru')") RU
    .langChanger__item(@click="changeLang('en')") EN

  .themeChanger(@click="$store.dispatch('changeTheme')") {{ $lang.changeTheme }}

  .tab__content
    AppName

    .loginButton(
      @click.prevent="signInWithGoogle"
      :class="{ _loading: loading.google }")
      transition(name="fadeIn")
        .loginButton__spiner(v-if="loading.google")
          Spiner
      .loginButton__text {{ $lang.loginWithGoogle }}

  .copyright
    Copyright
</template>

<style lang="stylus" scoped>
@import "~@/stylus/variables/animations"
@import "~@/stylus/variables/fonts"
@import "~@/stylus/variables/margins"
@import "~@/stylus/variables/media"
@import "~@/stylus/variables/scrollbar"

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
    padding 100px $m9

.langChanger
  display flex
  position absolute
  left $m7
  top $m7

  @media $media-laptop
    left $m9
    top $m9

  &__item
    padding 10px

.themeChanger
  position absolute
  right $m7
  top $m7
  padding 10px

  @media $media-laptop
    right $m9
    top $m9

.loginButton
  position relative
  overflow hidden
  cursor pointer
  margin-top $mb1
  padding $m7 $m9
  typo-btn(var(--c-font-1))
  background var(--c-red-1)
  border-radius 3px
  text-align center
  anim()
  @media $media-laptop
    margin-top $mb2
  &:hover
    background var(--c-red-2)
  &._loading
    cursor default
    background var(--c-red-2)
  &._grey
    margin-top $m9
    background var(--c-bg-5)
    /.theme-light &
      background var(--c-bg-12)

  &__text
    anim()
    ^[0]._loading &
      opacity 0

  &__spiner
    position absolute
    left 0
    top 0
    width 100%
    height 100%
    display flex
    align-items center
    justify-content center

.loginError
  position absolute
  left 0
  top 0
  width 100%
  padding $m7 $m9
  border-left 3px solid var(--c-expenses-1)
  background var(--noti-error-background)

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
