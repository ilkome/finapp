<script>
import { auth } from 'firebase/app'
import AppName from '@/components/shared/appName/AppName'
import Spiner from '@/components/shared/spiner/Spiner'

export default {
  components: {
    AppName,
    Spiner
  },

  data: () => ({
    error: null,
    loading: false
  }),

  methods: {
    signInWithGoogle () {
      this.error = null
      this.loading = true
      const provider = new auth.GoogleAuthProvider()
      auth().signInWithRedirect(provider)
        .catch(e => {
          this.$notify({
            title: 'Error',
            text: e.message,
            type: 'error'
          })
          this.error = e.message
          this.loading = false

          console.log(e)
        })
    },

    async signInWithEmail () {
      const email = ''
      const password = ''
      const user = await auth().signInWithEmailAndPassword(email, password)
      console.log(user)
    }
  }
}
</script>

<template lang="pug">
.login
  //- theme changer
  .login__themeChanger
    .themeChanger(@click="$store.dispatch('changeTheme')")
      .themeChanger__icon: .mdi.mdi-palette
      .themeChanger__text Change theme

  .login__wrap
    AppName

    //- button
    .login__button(
      @click.prevent="signInWithGoogle"
      :class="{ _loading: loading }")
      transition(name="fadeIn")
        .login__button-spiner(v-if="loading"): Spiner
      .login__button-text Login with Google

    transition(name="slide")
      .login__error(v-if="error") {{ error }}

  //- copy
  a(href="https://ilko.me").login__copy
    | Made with
    .login__heart.mdi.mdi-heart
    | by Ilya Komichev
</template>

<style lang="stylus" scoped>
@import "~@/stylus/variables/animations"
@import "~@/stylus/variables/fonts"
@import "~@/stylus/variables/margins"
@import "~@/stylus/variables/media"

.login
  position relative
  display flex
  flex-flow column
  width 100%
  height 100vh
  min-height 300px
  align-items center
  justify-content center
  padding 0 $m7

  &__themeChanger
    position absolute
    right $m7
    top $m7

  &__wrap
    display flex
    flex-flow column wrap
    align-items center

  &__copy
    position fixed
    display flex
    align-items center
    justify-content center
    left 0
    bottom 0
    width 100%
    margin-top auto
    padding $mn1
    color var(--c-font-2)
    text-decoration none

    @media $media-laptop
      bottom $mn2

  &__heart
    display inline-flex
    margin 0 $m5
    color rgba(210, 0, 20, 1)
    font-size $font-size-nb
    animation heartbeat 3s ease-in-out infinite

  &__error
    position absolute
    left 0
    bottom 150px
    width 100%
    padding $m7 50px
    font-size 12px
    border-left 2px solid var(-c-expenses)

  &__button
    position relative
    overflow hidden
    cursor pointer
    margin-top $mb1
    padding $m7 $m9
    typo-btn(var(--c-font-1))
    background var(--c-red-1)
    border-radius 3px

    @media $media-laptop
      margin-top $mb2

    &._loading
      cursor default
      background var(--c-red-2)

    &-text
      anim()

      ^[1]._loading &
        opacity 0

    &-spiner
      position absolute
      left 0
      top 0
      width 100%
      height 100%
      display flex
      align-items center
      justify-content center

@keyframes heartbeat
  0%
    transform:scale(.75)
  20%
    transform:scale(1)
  40%
    transform:scale(.75)
  60%
    transform:scale(1.1)
  80%
    transform:scale(.75)
  100%
    transform:scale(.75)
</style>
