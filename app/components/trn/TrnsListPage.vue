<template lang="pug">
div.trnsPage
  h1.title Транзакции
  TrnsList(:trns="trns.slice(0, 20)")
</template>


<script>
import groupBy from 'lodash/groupBy'
import { mapGetters } from 'vuex'
import moment from 'moment'
import formatMoney from '../../mixins/formatMoney'
import TrnsList from './TrnsList.vue'

export default {
  mixins: [formatMoney],

  computed: {
    ...mapGetters(['trns'])
  },

  components: { TrnsList }
}
</script>
