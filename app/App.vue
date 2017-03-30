<template lang="pug">
.app
  template(v-if="$store.state.loading")
    transition(name="fade")
      h1.loading Loading...

  template(v-else)
    Sidebar

    .main
      .topbar
        transition(name="topbar__anim")
          .topbar__status(v-if="$store.state.appStatus") {{ $store.state.appStatus }}

        MenuTop
        FilterTop

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
    console.time('App')
    await this.$store.dispatch('fetchAccounts')
    await this.$store.dispatch('fetchCategories')
    await this.$store.dispatch('fetchRates')
    await this.$store.dispatch('fetchTrns')
    await this.$store.commit('loading')
    console.timeEnd('App')
  },

  components: { Sidebar, MenuTop, FilterTop }
}
</script>
