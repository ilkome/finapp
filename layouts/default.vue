<script>
import debounce from '~/utils/debounce'

import Loader from '~/components/shared/loader/Loader'
import Metrica from '~/components/Metrica'

export default {
  name: 'DefaultLayout',

  components: {
    Loader,
    Metrica
  },

  async fetch () {
    try {
      await this.$store.dispatch('app/initApp')
      this.isAuth()
    }
    catch (error) {
      console.log('error', error)
    }
  },

  computed: {
    layoutStyles () {
      return { height: `${this.$store.state.ui.height}px` }
    },

    lang () {
      return this.$store.state.lang.lang
    }
  },

  watch: {
    lang (newValue, oldValue) {
      if (newValue !== oldValue) {
        this.$setLang(newValue)
      }
    }
  },

  mounted () {
    this.getPageDimensions()
    window.addEventListener('resize', debounce(this.getPageDimensions, 600))
  },

  methods: {
    isAuth () {
      const routeName = this.$route.name
      const user = this.$store.state.user.user

      if (routeName === 'login' && user !== null) {
        this.$router.replace('/')
      }
      else if (routeName !== 'login' && user === null) {
        this.$router.replace('login')
      }
    },

    getPageDimensions () {
      const width = document.documentElement.clientWidth
      const height = document.documentElement.clientHeight
      this.$store.dispatch('ui/setAppDimensions', { width, height })
    }
  },

  head () {
    const classes = [`theme-${this.$store.state.ui.theme}`]

    return {
      htmlAttrs: {
        class: classes
      }
    }
  }
}
</script>

<template lang="pug">
.finapp(:style="layoutStyles")

  //- loading
  template(v-if="$fetchState.pending || $store.state.app.status.loading")
    Loader

  //- Continue to page
  transition(name="fadeInSlow")
    template(v-if="!$fetchState.pending && $store.state.app.status.ready")
      Nuxt

  //- //- app
  //- transition(name="fadeInSlow")
  //-   template(v-if="$store.state.app.status.ready")
  //-     template(v-if="$store.getters.hasWallets && $store.getters.hasCategories")
  //-       Layout
  //-     Welcome(v-else)

  //- notifications
  Notifications(
    :position="$store.state.ui.mobile ? 'top center' : 'top left'"
      :width="$store.state.ui.mobile ? '94%' : '380px'"
    classes="notifications"
  )

  Metrica
</template>

<style lang="stylus">
@import "~assets/stylus/variables/fonts"
@import "~assets/stylus/common/notifications"
@import "~assets/stylus/index"

*
  box-sizing border-box
  -webkit-tap-highlight-color transparent

  &:focus
    outline 0

html
  font-size 16px
  overscroll-behavior-y contain

body
  overflow hidden
  margin 0
  color var(--c-font-2)
  font-primary()
  font-size 14px
  line-height 1
  letter-spacing 0
  overscroll-behavior-y contain
  background var(--c-bg-1)
  user-select none
</style>

<style lang="stylus" scoped>
@import "~assets/stylus/index"

.finapp
  display flex
  flex-flow column
  min-width 320px
</style>
