<template lang="pug">
.app
  template(v-if="$store.state.loading")
    transition(name="fade")
      h1.loading Loading...

  template(v-else)
    Sidebar

    .main
      .topBar
        .mainTopLeft
          MenuTop
        .mainTopRight
          FilterTop

      h1(v-if="$store.state.appStatus").panelTitle

      transition(name="slide")
        router-view
</template>


<script>
import Sidebar from './components/sidebar/Sidebar.vue'
import MenuTop from './components/menu/MenuTop.vue'
import FilterTop from './components/filter/FilterTop.vue'

export default {
  async created() {
    // should to be in this order because fetchTrns depends on others data
    await this.$store.dispatch('fetchAccounts')
    await this.$store.dispatch('fetchCategories')
    await this.$store.dispatch('fetchRates')
    await this.$store.dispatch('fetchTrns')
    await this.$store.commit('loading')
  },

  components: { Sidebar, MenuTop, FilterTop }
}
</script>
