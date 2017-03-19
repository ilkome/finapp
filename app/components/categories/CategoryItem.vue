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
import formatMoney from '../../mixins/formatMoney'
import ChartByCategory from '../chart/ChartByCategory.vue'

export default {
  mixins: [formatMoney],

  computed: {
    ...mapGetters(['categories']),
    category() {
      return this.categories.find(a => a.id === +this.$route.params.id)
    }
  },

  components: { ChartByCategory }
}
</script>
