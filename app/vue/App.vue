<template lang="pug">
  .app
    template(v-if="loading")
      //- transition(name="fade")
        h1.loading Loading...

    template(v-else)
      Sidebar(:accounts="appData.accounts", :rates="appData.rates")
      .main
        h1 Привет, Илюшкин :)
        .ui.segment
          router-link(to="/create").ui.button Создать
          router-link(to="/accounts").ui.button Кошельки
          router-link(to="/about").ui.button Обо мне
          router-link(to="/trns").ui.button Операции
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
      appData: {
        accounts: [],
        allTrns: [],
        rates: {}
      }
    }
  },

  async created() {
    const data = await getAppData()
    this.appData = { ...data }
    this.loading = false
  },

  components: {
    Sidebar
  }
}
</script>
