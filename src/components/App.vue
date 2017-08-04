<template lang="pug">
.app
  //- Loading
  //------------------------------------------------
  template(v-if="$store.state.loader && !$store.state.error")
    transition(name="fade")
      template(v-if="$store.state.error")
        .loading
          .loading__in
            .loading__name._error {{ $store.state.error }}
            .loading__update(@click.prevent="updateAppData()") Update Application
      template(v-else)
        h1.loading Loading...


  //- Loaded
  //------------------------------------------------
  template(v-else)
    //- Sidebar
    Sidebar
    .sidebarToogle(
      v-shortkey="['alt', 'arrowleft']",
      @shortkey="$store.commit('toogleLeftbar')",
      @click.prevent.stop="$store.commit('toogleLeftbar')",
      @mouseover="(e) => toogleSidebar(e)"
    )

    //- main
    .main(:class="$store.state.leftBar.isShow && '_withLeftBar'")
      transition(name="slide")
        router-view

    //- TrnForm
    transition(name="slideToLeft")
      .trnForm(v-show="$store.state.trnForm.isShow")
        TrnForm
    .trnFormToogle(
      v-shortkey="['alt', 'arrowright']",
      @shortkey="$store.commit('toogleTrnForm')",
      @click.prevent.stop="$store.commit('toogleTrnForm')",
      @mouseover="(e) => toogleTrnForm(e)",
      :class="{_active: $store.state.trnForm.isShow}"
    )
      .trnFormToogle__icon: .trnFormToogle__icon__in +
</template>


<script>
import debounce from 'lodash/debounce'
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
        this.$store.state.error = false
        // should to be in this order because getTrns depends on others data
        await this.$store.dispatch('getRates')
        await this.$store.dispatch('getAccounts')
        await this.$store.dispatch('getCategories')
        await this.$store.dispatch('getTrns')
        this.$store.commit('closeLoader')
      } catch (error) {
        this.$store.commit('showError', error.message)
      }
    }
  }
}
</script>
