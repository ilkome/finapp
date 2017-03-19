<template lang="pug">
div.trnsPage
  h1.panelTitle Транзакции

  template(v-for="(trn, index) in trnsList()")
    .trnsDay
      h3(v-if="!isSameDay(index)") {{ trn.date | date}}
      TrnItem(:trn="trn", :key="trn.id")
</template>


<script>
import { mapGetters } from 'vuex'
import moment from 'moment'
import formatMoney from '../../mixins/formatMoney'
import TrnItem from './TrnItem.vue'

export default {
  mixins: [formatMoney],

  computed: {
    ...mapGetters(['trns'])
  },

  methods: {
    trnsList() {
      return this.trns.slice(0, 10)
    },
    isSameDay(index) {
      const curDay = moment(this.trns[index].date).startOf('day').format()
      if (this.trns[index - 1]) {
        const prevDay = moment(this.trns[index - 1].date).startOf('day').format()
        if (curDay === prevDay) {
          return true
        }
      }
      return false
    }
  },

  components: { TrnItem }
}
</script>
