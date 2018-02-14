<template lang="pug">
.app
  notifications(
    group="foo"
    :duration="3000"
    :width="$store.state.isMobile ? '289' : 289"
    :position="$store.state.isMobile ? 'top right' : 'bottom left'"
  )

  template(v-if="!$store.state.isPageLoaded")
    Loading

  template(v-if="$store.state.isPageLoaded")
    //- Need to login
    template(v-if="!user && !$store.state.loader")
      Login

    //- Ok, run App
    template(v-else)
      //- Loading
      template(v-if="$store.state.loader")
        transition(name="fade")
          Loading(:showName="false")

      Sidebar
      Dashboard

      //- Create trn
      template(v-if="$store.state.isMobile")
        .trnFormButton(''
          @click.prevent.stop="$store.commit('toogleTrnForm')"
        ): .trnFormButton__icon: .mdi.mdi-plus

      //- Trn form
      TrnForm
      template(v-if="!$store.state.categories.create && !$store.state.categories.edit && !$store.state.accounts.create && !$store.state.accounts.edit")
        .trnFormToogle(
          v-shortkey="['alt', 'arrowright']",
          @shortkey="$store.commit('toogleTrnForm')",
          @click.prevent.stop="$store.commit('toogleTrnForm')",
          :class="{_active: $store.state.trnForm.isShow}"
        )

      CategoryListBar
      CategoryCreate

      //- Category: edit
      transition(name="slideToRight")
        CategoryEdit(v-if="$store.state.categories.edit")

      //- Account: create
      transition(name="slideToRight")
        AccountCreate(v-if="$store.state.accounts.create")

      //- Account: edit
      transition(name="slideToRight")
        AccountEdit(v-if="$store.state.accounts.edit")
</template>

<script>
import { mapGetters } from 'vuex'
import debounce from 'lodash/debounce'
import Sidebar from './sidebar/Sidebar.vue'
import TrnForm from '@components/trnForm/TrnForm.vue'
import Login from '@components/login/Login.vue'
import Loading from '@components/loading/Loading.vue'
import Dashboard from '@components/DashboardPage.vue'
import CategoryListBar from '@components/categories/CategoryListBar.vue'
import CategoryCreate from '@components/categories/CategoryCreate.vue'
import CategoryEdit from '@components/categories/CategoryEdit.vue'
import AccountCreate from '@components/accounts/AccountCreate.vue'
import AccountEdit from '@components/accounts/AccountEdit.vue'

export default {
  components: { Loading, Login, Dashboard, Sidebar, TrnForm, CategoryListBar, CategoryCreate, CategoryEdit, AccountCreate, AccountEdit },

  computed: {
    ...mapGetters(['user'])
  },

  async mounted() {
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
