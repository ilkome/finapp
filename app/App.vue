<template lang="pug">
.app
  template(v-if="$store.state.loading")
    transition(name="fade")
      h1.loading Loading...

  template(v-else)
    Sidebar

    .main
      .main__menutop
        MenuTop

      .module
        h1.module__title
          template(v-if="$store.state.globalStatus") {{ $store.state.globalStatus }}
          template(v-else) Привет, Ильюшкин :)

      transition(name="fade")
        router-view
</template>


<script>
import Sidebar from './components/sidebar/Sidebar'
import MenuTop from './components/menu/MenuTop'

export default {
  async created() {
    // should to be this order because fetchTrns depends on others data
    await this.$store.dispatch('fetchAccounts')
    await this.$store.dispatch('fetchCategories')
    await this.$store.dispatch('fetchRates')
    await this.$store.dispatch('fetchTrns')
    await this.$store.commit('loading')
  },

  components: { Sidebar, MenuTop }
}
</script>
