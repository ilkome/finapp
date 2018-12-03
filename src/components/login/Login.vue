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
.tab
  .themeChanger
    Button(
      icon="mdi mdi-palette"
      title="Change theme"
      v-on:onClick="$store.dispatch('changeTheme')")

  .tab__content
    AppName

    .loginButton(
      @click.prevent="signInWithGoogle"
      :class="{ _loading: loading }")
      transition(name="fadeIn")
        .loginButton__spiner(v-if="loading")
          Spiner
      .loginButton__text Login with Google

    transition(name="slide")
      .loginError(v-if="error") {{ error }}

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

.themeChanger
  position absolute
  right $m7
  top $m7

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

  @media $media-laptop
    margin-top $mb2

  &._loading
    cursor default
    background var(--c-red-2)

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
  bottom 150px
  width 100%
  padding $m7 50px
  font-size 12px
  border-left 2px solid var(-c-expenses)

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
