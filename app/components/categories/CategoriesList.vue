<template lang="pug">
.categoriesPage
  h1.title._mid Категории

  .table
    .table__cell
      input(type="text", v-model.trim="filter", placeholder="Фильтр").input-filter

      .trnList
        router-link.item(
          v-for="category in categoriesList",
          :to="`/categories/${category.id}`",
          :key="category.id"
        )
          .item__el
            .icon(:class="`icon-${category.id}`"): .icon__pic
          .item__el._name._grow {{ category.name }}

    .table__cell
      .categoriesIcons
        .categoriesIcons__el(v-for="category in categoriesList", :key="category.id")
          router-link.icon(
            :to="`/categories/${category.id}`",
            :class="`icon-${category.id}`",
            :title="category.name"
          )
            .icon__pic
</template>

<script>
import { mapGetters } from 'vuex'
import ChartByCategory from '../chart/ChartByCategory.vue'

export default {
  data() {
    return {
      filter: ''
    }
  },
  computed: {
    ...mapGetters(['categories']),
    categoriesList() {
      return this.categories.filter(category =>
        category.name.toLowerCase().search(this.filter.toLowerCase()) !== -1)
    }
  },
  components: { ChartByCategory }
}
</script>
