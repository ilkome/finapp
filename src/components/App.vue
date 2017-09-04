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
      .main(:class="$store.state.leftBar.isShow && '_withLeftBar'")
        transition(name="slide")
          keep-alive
            router-view

      //- TrnForm
      transition(name="slideToLeft")
        .trnForm(v-show="$store.state.trnForm.isShow")
          TrnForm
      .trnFormToogle(
        v-shortkey="['alt', 'arrowright']",
        @shortkey="onClickTrnFormToogle",
        @click.prevent.stop="onClickTrnFormToogle",
        :class="{_active: $store.state.trnForm.isShow}"
      ): .trnFormToogle__icon: .trnFormToogle__icon__in +
</template>

<script>
import Sidebar from './Sidebar.vue'
import TrnForm from './TrnForm.vue'
import Login from './Login.vue'

export default {
  components: { Sidebar, TrnForm, Login },

  computed: {
    user() {
      if (this.$store.state.user.user.uid) {
        return this.$store.state.user.user
      }
    }
  },

  methods: {
    toogleBodyOverflow() {
      if (this.$store.state.isMobile) {
        const body = document.querySelector('body')
        if (this.$store.state.trnForm.isShow || this.$store.state.leftBar.isShow) {
          body.style.overflow = 'hidden'
        } else {
          body.style.overflow = ''
        }
      }
    },

    onClickTrnFormToogle() {
      this.$store.commit('toogleTrnForm')
      this.toogleBodyOverflow()
    },

    onSidebarToogle() {
      this.$store.commit('toogleLeftbar')
      this.toogleBodyOverflow()
    }
  }
}
</script>
