<template lang="pug">
.app
  template(v-if="loading")
    //- transition(name="fade")
      h1.loading Loading...

  template(v-else)
    Sidebar(:accounts="appData.accounts", :rates="appData.rates")
    .main
      .module
        .module__title: h1 Привет, Илюшкин :)
        .module__content
          router-link(to="/create").ui.button Создать
          router-link(to="/accounts").ui.button Кошельки
          router-link(to="/about").ui.button Обо мне
          router-link(to="/trns").ui.button Операции
          div(v-if="alert") {{ alert }}
      transition(name="fade")
        router-view
</template>

<script>
import Sidebar from './Sidebar'
import { getAppData } from '../js/api'

export default {
  data() {
    return {
      loading: true,
      alert: '',
      appData: {
        accounts: [],
        categories: [],
        allTrns: [],
        rates: {}
      }
    }
  },

  methods: {
    async fetchData() {
      const data = await getAppData()
      this.appData = { ...data }
      this.loading = false
    }
  },

  watch: {
    '$route' (to, from) {
      if (this.$route.query && this.$route.query.alert) {
        this.alert = this.$route.query.alert
      } else {
        this.alert = ''
      }
    }
  },

  created() {
    this.fetchData()
  },

  components: { Sidebar }
}
</script>
