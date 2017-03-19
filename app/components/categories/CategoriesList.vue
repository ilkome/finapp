<template lang="pug">
.categoriesPage
  h1.panelTitle._mid Категории

  input(type="text", v-model.trim="filter", placeholder="Фильтр").input-filter

  .categoriesIcons
    .categoriesIcons__el(v-for="category in categoriesList", :key="category.id")
      router-link.icon(
        :to="`/categories/${category.id}`",
        :class="`icon-${category.id}`",
        :title="category.name"
      )
        .icon__pic

  .categoriesList
    router-link.trnItem(
      v-for="category in categoriesList",
      :to="`/categories/${category.id}`",
      :key="category.id"
    )
      .trnItem__el
        .icon(:class="`icon-${category.id}`"): .icon__pic
      .trnItem__el {{ category.name }}
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
