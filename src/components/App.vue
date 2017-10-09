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

      //- Mobile header
      template(v-if="$store.state.isMobile")
        .header
          .header__in
            .header__item.fa.fa-bars(@click.prevent.stop="onSidebarToogle")

            template(v-if="$route.name === 'dashboard'")
              .header__item
                .dateTitle__item
                  h1.dateTitle__header(@click.prevent.stop="openPopupCalendar($event)")
                    .dateTitle__icon.mdi.mdi-calendar-multiple
                    .dateTitle__firstDate {{ $store.state.filter.filter.date.first }}

            .header__item.fa.fa-plus(@click.prevent.stop="onClickTrnFormToogle")

      //- Sidebar
      Sidebar
      .sidebarToogle(
        v-shortkey="['alt', 'arrowleft']",
        @shortkey="onSidebarToogle",
        @click.prevent.stop="onSidebarToogle")

      //- main
      .main(:class="$store.state.leftBar.isShow && '_withLeftBar'")
        transition(name="slide")
          router-view

      //- TrnForm
      transition(name="slideToLeft")
        .trnForm(v-show="$store.state.trnForm.isShow")
          TrnForm
      //- TrnForm btn
      template(v-if="!$store.state.categories.create && !$store.state.categories.edit && !$store.state.accounts.create && !$store.state.accounts.edit")
        .trnFormToogle(
          v-shortkey="['alt', 'arrowright']",
          @shortkey="onClickTrnFormToogle",
          @click.prevent.stop="onClickTrnFormToogle",
          :class="{_active: $store.state.trnForm.isShow}"
        ): .trnFormToogle__icon: .trnFormToogle__icon__in +

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

      //- Create account
      transition(name="slideToLeft")
        AccountCreate(v-if="$store.state.accounts.create")
      //- Edit account
      transition(name="slideToLeft")
        AccountEdit(v-if="$store.state.accounts.edit")

</template>

<script>
import debounce from 'lodash/debounce'
import Sidebar from './Sidebar.vue'
import TrnForm from './TrnForm.vue'
import Login from './Login.vue'
import CategoryList from './categories/CategoryList.vue'
import CategoryCreate from './categories/CategoryCreate.vue'
import CategoryEdit from './categories/CategoryEdit.vue'
import AccountCreate from './accounts/AccountCreate.vue'
import AccountEdit from './accounts/AccountEdit.vue'

export default {
  components: { Login, Sidebar, TrnForm, CategoryList, CategoryCreate, CategoryEdit, AccountCreate, AccountEdit },

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

    this.$nextTick(() => {
      window.addEventListener('resize', debounce(this.checkAndSetMobileOrPCVersion, 300))
      this.checkAndSetMobileOrPCVersion()
    })
  },

  methods: {
    checkAndSetMobileOrPCVersion(event) {
      if (document.documentElement.clientWidth > 600) {
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
    openPopupCalendar(event) {
      this.$store.commit('setFilterCalendar', {
        show: !this.$store.state.filter.filter.calendar.show,
        left: 0,
        top: 15
      })
    },
    toogleBodyOverflow() {
      if (this.$store.state.isMobile) {
        const body = document.querySelector('body')
        if (this.$store.state.trnForm.isShow || this.$store.state.leftBar.isShow) {
          body.style.overflow = 'hidden'
        } else {
          body.style.overflow = ''
        }
      }
    }
  }
}
</script>
