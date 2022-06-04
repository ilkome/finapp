<script lang="ts">
// TODO: setup
import { GoogleAuthProvider, signInWithRedirect } from 'firebase/auth'
import { auth } from '~/services/firebase/api'

export default defineComponent({
  layout: 'login',

  setup() {
    const isLoading = ref(false)

    const route = useRoute()
    if (route.query?.loading)
      isLoading.value = true

    setTimeout(() => { isLoading.value = false }, 10000)

    return {
      isLoading,
    }
  },

  fetch({ store, redirect }) {
    if (store.state.user?.user)
      redirect('/')
  },

  methods: {
    signInWithGoogle() {
      this.$router.push({ query: { loading: true } })
      this.isLoading = true

      const provider = new GoogleAuthProvider()
      signInWithRedirect(auth, provider)
        .catch(e => this.notifyAboutError(e))
    },

    notifyAboutError(e) {
      this.$notify({
        duration: 6000,
        text: e.message,
        title: 'Error',
        type: 'error',
      })
      this.isLoading = false
    },

    onSetLocale(lang) {
      this.$store.dispatch('lang/setLang', lang)
    },
  },
})
</script>

<template lang="pug">
.tab
  .py-4.px-3.h-24.justify-between.items-start.flex
    .flex.gap-1.top-3.left-5(
      class="lg_top-7 lg_left-7"
    )
      .linkItem.py-2.px-3.rounded-md(
        :class="[{ 'text-blue2 dark_text-blue1': $store.state.lang.lang === 'ru' }, 'hocus_bg-white2 dark_hocus_bg-custom1']"
        @click="onSetLocale('ru')"
      ) Русский
      .linkItem.py-2.px-3.rounded-md(
        :class="[{ 'text-blue2 dark_text-blue1': $store.state.lang.lang === 'en' }, 'hocus_bg-white2 dark_hocus_bg-custom1']"
        @click="onSetLocale('en')"
      ) English

    .flex.gap-3.top-3.right-5(
      class="lg_top-7 lg_right-7"
    )
      .linkItem.py-2.px-3.rounded-md.hocus_bg-white2.dark_hocus_bg-custom1(
        @click="$store.dispatch('ui/changeTheme')"
      ) {{ $t('changeTheme') }}

  .tab__content
    SharedAppName
    SharedCopyright

  .flex.flex-col.items-center.px-3.py-8
    .loginButton.bg-blue3.hocus_bg-blue1.hocus_shadow(
      :class="[{ _loading: isLoading }]"
      @click.prevent="signInWithGoogle"
    )
      transition(name="fadeIn")
        .loginButton__spinier(v-if="isLoading"): SharedSpinier
      .loginButton__text.text-white {{ $t('loginWithGoogle') }}
</template>

<style lang="stylus" scoped>
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

  +media(600px)
    grid-template-rows auto auto auto

  &__content
    display flex
    align-items center
    justify-content center
    flex-flow column

.linkItem
  text-decoration none

  +media-hover()
    &:not(._active)
      cursor pointer

.loginButton
  overflow hidden
  cursor pointer
  position relative
  min-width 260px
  padding $m7 $mb1
  font-size 16px
  text-align center
  border-radius 36px
  anim()

  &._loading
    pointer-events none
    cursor default

  &__text
    anim()

    ^[0]._loading &
      opacity 0

  &__spinier
    position absolute
    top 0
    left 0
    display flex
    align-items center
    justify-content center
    width 100%
    height 100%
</style>
