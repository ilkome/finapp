<template lang="pug">
.app
  template(v-if="!$store.state.isPageLoaded")
    h1.loading Loading...

  template(v-if="$store.state.isPageLoaded")

    //- Loading
    template(v-if="$store.state.loader")
      transition(name="fade")
        h1.loading Loading...

    template(v-if="$store.state.error")
      transition(name="fade")
        .loading
          .loading__in
            .loading__name._error {{ $store.state.error }}
            .loading__update(@click.prevent="updateAppData()") Update Application

    //- Sidebar
    Sidebar
    .sidebarToogle(
      v-shortkey="['alt', 'arrowleft']",
      @shortkey="$store.commit('toogleLeftbar')",
      @click.prevent.stop="$store.commit('toogleLeftbar')"
    )

    //- main
    .main(:class="$store.state.leftBar.isShow && '_withLeftBar'")
      transition(name="slide")
        keep-alive(include="DashboardPage")
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
    )
      .trnFormToogle__icon: .trnFormToogle__icon__in +
</template>


<script>
import Sidebar from './Sidebar.vue'
import TrnForm from './TrnForm.vue'

export default {
  components: { Sidebar, TrnForm },

  async created() {
    this.updateAppData()
  },

  methods: {
    async updateAppData() {
      try {
        this.$store.commit('showError', false)
        // should to be in this order because getTrns depends on others data
        await this.$store.dispatch('getRates')
        await this.$store.dispatch('getAccounts')
        await this.$store.dispatch('getCategories')
        await this.$store.dispatch('getTrns')
        this.$store.commit('pageLoaded')
        this.$store.commit('closeLoader')
      } catch (error) {
        this.$store.commit('showError', error.message)
      }
    }
  }
}
</script>
