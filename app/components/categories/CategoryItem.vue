<template lang="pug">
.categoryPage
  h1.title
    | Категория:
    .name {{ category.name }}
    .icon(:class="`icon-${category.id}`"): .icon__pic
    .sup  {{ category.id }}

  ChartByCategory(:categoryId="+$route.params.id")

  .trnsList
    h2.title Транзакции
    template(v-for="(trn, index) in trnsList")
      .trnsDay
        h3(v-if="!isSameDay(index)") {{ trn.date | date}}
        TrnItem(:trn="trn", :key="trn.id")
</template>

<script>
import moment from 'moment'
import { mapGetters } from 'vuex'
import formatMoney from '../../mixins/formatMoney'
import ChartByCategory from '../chart/ChartByCategory.vue'
import TrnItem from '../trn/TrnItem.vue'

export default {
  mixins: [formatMoney],

  computed: {
    ...mapGetters(['categories', 'trns']),
    category() {
      return this.categories.find(a => a.id === +this.$route.params.id)
    },
    trnsList() {
      return this.trns.filter(trn => trn.categoryId === +this.$route.params.id).slice(0, 20)
    }
  },

  methods: {
    isSameDay(index) {
      const curDay = moment(this.trnsList[index].date).startOf('day').format()
      if (this.trnsList[index - 1]) {
        const prevDay = moment(this.trnsList[index - 1].date).startOf('day').format()
        if (curDay === prevDay) {
          return true
        }
      }

      return false
    }
  },

  components: { ChartByCategory, TrnItem }
}
</script>
