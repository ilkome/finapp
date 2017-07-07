<template lang="pug">
.content
  .module
    h1.title Transactions
    TrnsList(:trns="trnsList")
</template>


<script>
import { mapGetters } from 'vuex'
import orderBy from 'lodash/orderBy'
import formatMoney from '../mixins/formatMoney'
import TrnsList from './TrnsList.vue'

export default {
  mixins: [formatMoney],

  computed: {
    ...mapGetters(['trns', 'accounts', 'categories']),

    trnsList() {
      const trns = this.$store.state.trns.all.slice(0, 100)
      return orderBy(trns, 'date', 'desc')
    }
  },

  components: { TrnsList }
}
</script>
