<script>
import debounce from 'lodash/debounce'

import LayoutMobile from '@/components/layout/LayoutMobile'
import LayoutPc from '@/components/layout/LayoutPc'
import Loader from '@/components/shared/loader/Loader'
import Login from '@/components/login/Login'
import Welcome from '@/components/welcome/Welcome'

import '@/stylus/index.styl'

export default {
  components: {
    Loader,
    LayoutMobile,
    LayoutPc,
    Welcome,
    Login
  },

  computed: {
    layoutStyles () {
      return { height: `${this.$store.state.ui.height}px` }
    }
  },

  created () {
    this.$store.dispatch('initApp')
    this.handleWindowHistory()
    this.getPageDimensions()
    window.addEventListener('resize', debounce(this.getPageDimensions, 1000))
  },

  methods: {
    handleWindowHistory () {
      window.history.pushState(null, document.title, window.location.href)
      window.onpopstate = () => {
        window.history.pushState(null, document.title, window.location.href)
        const trnFormModal = this.$store.state.trnForm.modal
        const categoryModal = this.$store.state.categories.modal.show
        const walletModal = this.$store.state.wallets.modal.show
        const trnModal = this.$store.state.trns.modal.show

        // trnForm
        if (trnFormModal.categoriesChild) this.$store.commit('closeTrnFormModal', 'categoriesChild')
        else if (trnFormModal.categories) this.$store.commit('closeTrnFormModal', 'categories')
        else if (trnFormModal.wallets) this.$store.commit('closeTrnFormModal', 'wallets')
        else if (trnFormModal.calendar) this.$store.commit('closeTrnFormModal', 'calendar')
        else if (trnFormModal.description) this.$store.commit('closeTrnFormModal', 'description')
        else this.$store.commit('closeTrnForm')

        if (trnModal) this.$store.commit('hideTrnModal')
        if (categoryModal) this.$store.commit('hideCategoryModal')
        if (walletModal) this.$store.commit('hideWalletModal')
      }
    },

    getPageDimensions () {
      const width = document.documentElement.clientWidth
      const height = document.documentElement.clientHeight
      this.$store.dispatch('setAppDimensions', { width, height })
    }
  }
}
</script>

<template lang="pug">
.finapp(:style="layoutStyles")
  //- loading
  template(v-if="$store.state.app.status.loading")
    Loader

  //- login
  transition(name="fadeInSlow")
    template(v-if="$store.state.app.status.login")
      Login

  //- app
  transition(name="fadeInSlow")
    template(v-if="$store.state.app.status.ready")
      template(v-if="$store.getters.hasWallets && $store.getters.hasCategories")
        LayoutMobile(v-if="$store.state.ui.mobile")
        LayoutPc(v-else)
      Welcome(v-else)

  //- notifications
  notifications(
    group="main"
    :position="$store.state.ui.mobile ? 'top right' : 'top left'"
    :width="$store.state.ui.mobile ? '100%' : '320'"
  )
</template>

<style lang="stylus">
@import "~@/stylus/variables/fonts"

*
  box-sizing border-box
  &:focus
    outline 0

html
  font-size 16px
  overscroll-behavior-y contain

.body
  overflow hidden
  margin 0
  color var(--c-font-2)
  font-primary()
  line-height 1
  letter-spacing 0
  user-select none
  overscroll-behavior-y contain
  background var(--c-bg-1)
</style>

<style lang="stylus" scoped>
.finapp
  display flex
  flex-flow column
  min-width 320px
</style>
