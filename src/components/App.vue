<template lang="pug">
.app
  //- Loading
  //------------------------------------------------
  template(v-if="$store.state.pageLoading")
    transition(name="fade")
      template(v-if="$store.state.error")
        .loading._alpha._error {{ $store.state.error }}
      template(v-else)
        h1.loading Loading...


  //- Loaded
  //------------------------------------------------
  template(v-else)
    template(v-if="$store.state.loader && !$store.state.error")
      .loading._alpha Loading...
    template(v-if="$store.state.error")
      .loading._alpha._error
        .loading__in
          .loading__name._error {{ $store.state.error }}
          .loading__update(@click.prevent="updateAppData()") Update Application

    Sidebar
    .main
      .topbar
        .topbar__in
          nav.menu
            router-link(to="/" exact).menuLink Dashboard
            router-link(to="/summary").menuLink Total
            router-link(to="/incomes").menuLink Incomes
            router-link(to="/expenses").menuLink Expenses
            router-link(to="/categories").menuLink Categories
            router-link(to="/accounts").menuLink Accounts
            router-link(to="/trns").menuLink History

          a.toogleTrnCreateBtn(
            @click.prevent.stop="$store.commit('toogleTrnForm')",
            :class="{_active: $store.state.trnForm.isShow}")
            .toogleTrnCreateBtn__icon: .toogleTrnCreateBtn__icon__in +

        transition(name="slideToLeft")
          .rightBar(v-show="$store.state.trnForm.isShow")
            .rightBar__in
              TrnForm

      transition(name="slide")
        router-view
</template>


<script>
import Sidebar from './Sidebar.vue'
import TrnForm from './TrnForm.vue'

export default {
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
        this.$store.commit('pageLoaded')
        this.$store.commit('disableLoader')
      } catch (error) {
        this.$store.commit('showError', error.message)
      }
    }
  },

  components: { Sidebar, TrnForm }
}
</script>
