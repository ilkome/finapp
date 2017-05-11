<template lang="pug">
.content
  .module
    h1.title Транзакции

  .module._bg
    TrnsList(:trns="trns.slice(0, 50)")
</template>


<script>
import groupBy from 'lodash/groupBy'
import { mapGetters } from 'vuex'
import moment from 'moment'
import formatMoney from '../mixins/formatMoney'
import TrnsList from './TrnsList.vue'

export default {
  mixins: [formatMoney],

  computed: {
    ...mapGetters(['trns'])
  },

  components: { TrnsList }
}
</script>
