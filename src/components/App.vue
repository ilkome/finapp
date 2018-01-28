<template lang="pug">
.app
  notifications(
    group="foo"
    :duration="3000"
    :width="$store.state.isMobile ? '100%' : 300"
    :position="$store.state.isMobile ? 'bottom left' : 'top left'"
  )

  template(v-if="!$store.state.isPageLoaded")
    .loading
      .loading__spin
        .logo
          svg(xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100")
            path(d="M92.48,7.69C117.38,32.6,61.89,32.06,61.89,50s55.49,17.38,30.58,42.28S68.11,61.68,50.19,61.68,32.81,117.17,7.91,92.26,38.49,67.9,38.49,50-17,32.6,7.91,7.69,32.27,38.28,50.19,38.28,67.57-17.22,92.48,7.69Z")


  template(v-if="$store.state.isPageLoaded")
    //- Need to login
    template(v-if="!user && !$store.state.loader")
      Login

    //- Ok, run App
    template(v-else)
      //- Loading
      template(v-if="$store.state.loader")
        transition(name="fade")
          .loading
            .loading__spin
              .logo
                svg(xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100")
                  path(d="M92.48,7.69C117.38,32.6,61.89,32.06,61.89,50s55.49,17.38,30.58,42.28S68.11,61.68,50.19,61.68,32.81,117.17,7.91,92.26,38.49,67.9,38.49,50-17,32.6,7.91,7.69,32.27,38.28,50.19,38.28,67.57-17.22,92.48,7.69Z")

      Sidebar
      Dashboard

      //- TrnForm
      transition(name="slideToLeft")
        TrnForm(v-show="$store.state.trnForm.isShow")
      template(v-if="!$store.state.categories.create && !$store.state.categories.edit && !$store.state.accounts.create && !$store.state.accounts.edit")
        .trnFormToogle(
          v-shortkey="['alt', 'arrowright']",
          @shortkey="$store.commit('toogleTrnForm')",
          @click.prevent.stop="$store.commit('toogleTrnForm')",
          :class="{_active: $store.state.trnForm.isShow}"
        ): .trnFormToogle__icon: .trnFormToogle__icon__in +

      //- Category: list
      transition(name="slideToRight")
        CategoryListBar(v-if="$store.state.categories.list")

      //- Category: create
      transition(name="slideToLeft")
        CategoryCreate(v-if="$store.state.categories.create")

      //- Category: edit
      transition(name="slideToLeft")
        CategoryEdit(v-if="$store.state.categories.edit")

      //- Accounts: list
      transition(name="slideToRight")
        AccountList(v-if="$store.state.accounts.show")

      //- Account: create
      transition(name="slideToLeft")
        AccountCreate(v-if="$store.state.accounts.create")

      //- Account: edit
      transition(name="slideToLeft")
        AccountEdit(v-if="$store.state.accounts.edit")
</template>

<script>
import { mixin } from 'vue-focus'
import debounce from 'lodash/debounce'
import Sidebar from './sidebar/Sidebar.vue'
import TrnForm from './TrnForm.vue'
import Login from './Login.vue'
import Dashboard from './DashboardPage.vue'
import CategoryListBar from './categories/CategoryListBar.vue'
import CategoryCreate from './categories/CategoryCreate.vue'
import CategoryEdit from './categories/CategoryEdit.vue'
import AccountCreate from './accounts/AccountCreate.vue'
import AccountEdit from './accounts/AccountEdit.vue'
import AccountList from './accounts/AccountList.vue'

export default {
  mixins: [mixin],
  components: { Login, Dashboard, Sidebar, TrnForm, CategoryListBar, CategoryCreate, CategoryEdit, AccountCreate, AccountEdit, AccountList },

  computed: {
    user() {
      if (this.$store.state.user.user.uid) {
        return this.$store.state.user.user
      }
    }
  },

  mounted() {
    this.$store.watch((state) => state.trnForm.isShow, this.toogleBodyOverflow)
    this.$store.watch((state) => state.showedLeftbar, this.toogleBodyOverflow)
    this.$store.watch((state) => state.categories.list, this.toogleBodyOverflow)
    this.$store.watch((state) => state.accounts.show, this.toogleBodyOverflow)

    this.$nextTick(() => {
      window.addEventListener('resize', debounce(this.checkAndSetMobileOrPCVersion, 300))
      this.checkAndSetMobileOrPCVersion()
    })

    document.addEventListener('keyup', (event) => {
      if (event.keyCode === 27) { // escape key
        this.$store.commit('toogleAccountList', 'hide')
        this.$store.commit('toogleCategoriesList', 'hide')
      }
    })
  },

  methods: {
    checkAndSetMobileOrPCVersion(event) {
      if (document.documentElement.clientWidth >= 768) {
        this.$store.commit('setMobile', false)
        this.$store.commit('toogleLeftbar', 'show')
      } else {
        this.$store.commit('setMobile', true)
        this.$store.commit('toogleLeftbar', 'hide')
      }
    },
    toogleBodyOverflow() {
      if (this.$store.state.isMobile) {
        const body = document.querySelector('body')
        if (this.$store.state.trnForm.isShow || this.$store.state.showedLeftbar || this.$store.state.accounts.show || this.$store.state.categories.list) {
          body.style.overflow = 'hidden'
        } else {
          body.style.overflow = ''
        }
      }
    }
  }
}
</script>
