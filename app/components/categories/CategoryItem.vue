<template lang="pug">
.categoryPage
  h1.panelTitle
    | Категория:
    .name {{ category.name }}
    .icon(:class="`icon-${category.id}`"): .icon__pic
    .sup  {{ category.id }}

  ChartByCategory(:categoryId="+$route.params.id")
</template>

<script>
import { mapGetters } from 'vuex'
import formatMoney from '../../mixins/money'
import ChartByCategory from '../chart/ChartByCategory.vue'

export default {
  mixins: [formatMoney],

  computed: {
    ...mapGetters(['categories']),
  //   category() {
  //     return this.categories.find(a => a.id === +this.$route.params.id)
  //   },
    category() {
      return this.categories.find(a => a.id === +this.$route.params.id)
    }
  },

  // methods: {
  //   isSameDay(index) {
  //     const curDay = moment(this.trnsList[index].date).startOf('day').format()
  //     if (this.trnsList[index - 1]) {
  //       const prevDay = moment(this.trnsList[index - 1].date).startOf('day').format()
  //       if (curDay === prevDay) {
  //         return true
  //       }
  //     }
  //
  //     return false
  //   }
  // },

  components: { ChartByCategory }
}
</script>
