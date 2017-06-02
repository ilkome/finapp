<template lang="pug">
.app
  template(v-if="$store.state.pageLoading")
    transition(name="fade")
      h1.loading Loading...

  template(v-else)
    .loading._alpha(v-if="$store.state.loader") Loading...

    Sidebar

    .main
      .topbar
        nav.menu
          //- a.menuLink(@click="back()") ← Back
          router-link(to="/" exact).menuLink Dashboard
          router-link(to="/summary").menuLink Summary
          router-link(to="/incomes").menuLink Incomes
          router-link(to="/expenses").menuLink Expenses
          router-link(to="/categories").menuLink Categories
          router-link(to="/accounts").menuLink Accounts
          router-link(to="/trns").menuLink History

        a.toogleTrnCreateBtn(@click.prevent="toogleRightSidebar()", :class="{_active: showRightSidebar}")
          .toogleTrnCreateBtn__icon: .toogleTrnCreateBtn__icon__in +

      transition(name="slideToLeft")
        .rightBar(v-show="showRightSidebar")
            TrnCreate

      transition(name="slide")
        router-view
</template>


<script>
import Sidebar from './Sidebar.vue'
import TrnCreate from './TrnCreate.vue'

export default {
  data() {
    return {
      showRightSidebar: false
    }
  },

  async created() {
    // should to be in this order because fetchTrns depends on others data
    await this.$store.dispatch('fetchRates')
    await this.$store.dispatch('fetchAccounts')
    await this.$store.dispatch('getCategories')
    await this.$store.dispatch('fetchTrns')
    await this.$store.commit('pageLoaded')
  },

  methods: {
    toogleRightSidebar() {
      this.showRightSidebar = !this.showRightSidebar
    },

    back() {
      window.history.back()
    }
  },

  components: { Sidebar, TrnCreate }
}
</script>
