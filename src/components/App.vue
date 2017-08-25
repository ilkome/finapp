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
        @shortkey="$store.commit('toogleLeftbar')",
        @click.prevent.stop="$store.commit('toogleLeftbar')")

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
        @shortkey="$store.commit('toogleTrnForm')",
        @click.prevent.stop="$store.commit('toogleTrnForm')",
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
  }
}
</script>
