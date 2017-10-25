<template lang="pug">
.app
  template(v-if="!$store.state.isPageLoaded")
    h1.loading Loading...

  template(v-if="$store.state.isPageLoaded")
    //- Need to login
    //------------------------------------------------
    template(v-if="!user && !$store.state.loader")
      Login

    //- Auth user
    //------------------------------------------------
    template(v-else)
      //- Loading
      template(v-if="$store.state.loader")
        transition(name="fade")
          h1.loading Loading...

      template(v-if="$store.state.error")
        transition(name="fade")
          .loading
            .loading__in
              .loading__name._error {{ $store.state.error }}
              .loading__update Please, reload Application

      //- Sidebar
      Sidebar
      .sidebarToogle(
        v-shortkey="['alt', 'arrowleft']",
        @shortkey="onSidebarToogle",
        @click.prevent.stop="onSidebarToogle")

      //- main
      Dashboard

      //- TrnForm
      transition(name="slideToLeft")
        TrnForm(v-show="$store.state.trnForm.isShow")
      //- TrnForm btn
      template(v-if="!$store.state.categories.create && !$store.state.categories.edit && !$store.state.accounts.create && !$store.state.accounts.show && !$store.state.accounts.edit && !$store.state.categories.list")
        .trnFormToogle(
          v-shortkey="['alt', 'arrowright']",
          @shortkey="onClickTrnFormToogle",
          @click.prevent.stop="onClickTrnFormToogle",
          :class="{_active: $store.state.trnForm.isShow}"
        ): .trnFormToogle__icon: .trnFormToogle__icon__in +

      //- Show categories
      transition(name="slideToLeft")
        CategoryListBar(v-if="$store.state.categories.list")
      //- Create category
      transition(name="slideToLeft")
        CategoryCreate(v-if="$store.state.categories.create")
      //- Edit category
      transition(name="slideToLeft")
        CategoryEdit(v-if="$store.state.categories.edit")
      //- Create / edit category popup list
      transition(name="slideToLeft")
        .trnForm(v-show="$store.state.categories.show")
          CategoryList(:isShowEditActions.sync="isShowEditActions")

      //- Show accounts
      transition(name="slideToLeft")
        AccountList(v-if="$store.state.accounts.show")
      //- Create account
      transition(name="slideToLeft")
        AccountCreate(v-if="$store.state.accounts.create")
      //- Edit account
      transition(name="slideToLeft")
        AccountEdit(v-if="$store.state.accounts.edit")

</template>

<script>
import { mixin } from 'vue-focus'
import debounce from 'lodash/debounce'
import Sidebar from './Sidebar.vue'
import TrnForm from './TrnForm.vue'
import Login from './Login.vue'
import Dashboard from './DashboardPage.vue'
import CategoryList from './categories/CategoryList.vue'
import CategoryListBar from './categories/CategoryListBar.vue'
import CategoryCreate from './categories/CategoryCreate.vue'
import CategoryEdit from './categories/CategoryEdit.vue'
import AccountCreate from './accounts/AccountCreate.vue'
import AccountEdit from './accounts/AccountEdit.vue'
import AccountList from './accounts/AccountList.vue'

export default {
  mixins: [mixin],
  components: { Login, Dashboard, Sidebar, TrnForm, CategoryList, CategoryListBar, CategoryCreate, CategoryEdit, AccountCreate, AccountEdit, AccountList },

  data() {
    return {
      isShowEditActions: true
    }
  },

  computed: {
    user() {
      if (this.$store.state.user.user.uid) {
        return this.$store.state.user.user
      }
    }
  },

  mounted() {
    this.$store.watch((state) => state.trnForm.isShow, this.toogleBodyOverflow)
    this.$store.watch((state) => state.leftBar.isShow, this.toogleBodyOverflow)
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
      if (document.documentElement.clientWidth > 768) {
        this.$store.commit('setMobile', false)
      } else {
        this.$store.commit('setMobile', true)
        this.$store.commit('toogleLeftbar', 'hide')
      }
    },
    onClickTrnFormToogle() {
      this.$store.commit('toogleTrnForm')
    },
    onSidebarToogle() {
      this.$store.commit('toogleLeftbar')
    },
    toogleBodyOverflow() {
      if (this.$store.state.isMobile) {
        const body = document.querySelector('body')
        if (this.$store.state.trnForm.isShow || this.$store.state.leftBar.isShow || this.$store.state.accounts.show) {
          body.style.overflow = 'hidden'
        } else {
          body.style.overflow = ''
        }
      }
    }
  }
}
</script>
