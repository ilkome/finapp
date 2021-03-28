<script>
import firebase from 'firebase/app'
import { ref, useContext } from '@nuxtjs/composition-api'

export default {
  name: 'LoginPage',

  setup () {
    const { query } = useContext()
    const isLoading = ref(false)

    if (query.value && query.value.loading) {
      isLoading.value = true
    }

    setTimeout(() => {
      isLoading.value = false
    }, 10000)

    return {
      isLoading
    }
  },

  fetch ({ store, redirect }) {
    if (store.state.user && store.state.user.user) {
      redirect('/')
    }
  },

  methods: {
    signInWithGoogle () {
      this.$router.push({ query: { loading: true } })
      this.isLoading = true

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
      this.isLoading = false
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
      .linkItem(
        @click="changeLang('ru')"
        :class="{ _active: $store.state.lang.lang === 'ru' }"
      ) RU
      .linkItem(
        @click="changeLang('en')"
        :class="{ _active: $store.state.lang.lang === 'en' }"
      ) EN

    .themeChanger
      .linkItem(@click="$store.dispatch('ui/changeTheme')") {{ $t('changeTheme') }}

  .tab__content
    SharedAppName
    SharedCopyright

  .tab__bottom
    .loginButton(
      :class="{ _loading: isLoading }"
      @click.prevent="signInWithGoogle"
    )
      transition(name="fadeIn")
        .loginButton__spiner(v-if="isLoading"): SharedSpiner
      .loginButton__text {{ $t('loginWithGoogle') }}
</template>

<style lang="stylus" scoped>
@import '~assets/stylus/variables/animations'
@import '~assets/stylus/variables/fonts'
@import '~assets/stylus/variables/margins'
@import '~assets/stylus/variables/media'
@import '~assets/stylus/variables/scroll'

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

.themeChanger
  cursor pointer
  position absolute
  top $m7
  right $m7

  @media $media-laptop
    top $mn1
    right $m9

.linkItem
  cursor pointer
  padding 8px 10px
  color var(--color-text-link)
  text-decoration none

  +media-hover()
    &:not(._active)
      background var(--color-link-bg)
      border-radius 4px

  &._active
    cursor default
    color var(--color-text-link-active)

    +media-hover()
      text-decoration none

.loginButton
  overflow hidden
  cursor pointer
  position relative
  min-width 260px
  padding $m7 $mb1
  color var(--c-font-1)
  font-size 16px
  text-align center
  background var(--c-blue-3)
  border-radius 36px
  anim()

  &:hover
    background var(--c-blue-4)

  &._loading
    pointer-events none
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
