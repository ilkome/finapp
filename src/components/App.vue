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

    transition(name="leftBarAnimation")
      .sidebar(v-show="$store.state.leftBar.isShow")
        Sidebar

    .sidebarToogle(
      v-shortkey="['alt', 'arrowleft']",
      @shortkey="$store.commit('toogleLeftBar')",
      @click.prevent="$store.commit('toogleLeftBar')"
    )
      .sidebarToogle__icon
        .fa.fa-bars

    .topbar(:class="$store.state.leftBar.isShow && '_withLeftBar'")
      .topbar__in
        nav.menu
          router-link(to="/" exact).menuLink Dashboard
          router-link(to="/summary").menuLink Total
          router-link(to="/incomes").menuLink Incomes
          router-link(to="/expenses").menuLink Expenses
          router-link(to="/categories").menuLink Categories
          router-link(to="/accounts").menuLink Accounts
          router-link(to="/trns").menuLink History

    a(
      v-shortkey="['alt', 'arrowright']",
      @shortkey="$store.commit('toogleTrnForm')",
      @click.prevent.stop="$store.commit('toogleTrnForm')",
      :class="{_active: $store.state.trnForm.isShow}"
    ).trnFormToogle
      .trnFormToogle__icon: .trnFormToogle__icon__in +

    transition(name="slideToLeft")
      .trnForm(v-show="$store.state.trnForm.isShow")
        TrnForm

    .main(:class="$store.state.leftBar.isShow && '_withLeftBar'")
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
