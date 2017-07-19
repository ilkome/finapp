<template lang="pug">
.categoriesList
  //- pre {{ activeCategory }}

  CategoryListItem(
    v-for="category in categories",
    :key="category.id",
    :category="category",
    :isSearch="isSearch",
    :activeCategory="activeCategory",
    @setCategory="setCategory",
    @toogleCategory="toogleCategory"
  )
    template(v-if="category.children && category.children.length")
      template(v-if="isToogleCategories.indexOf(category.id) !== -1")
        .categoryItem__children
          CategoryListChild(
            v-for="shildrenCategory in category.children",
            :key="shildrenCategory.id",
            :category="shildrenCategory",
            :isSearch="isSearch",
            :activeCategory="activeCategory",
            :children="true",
            @setCategory="setCategory",
            @toogleCategory="toogleCategory"
          )
</template>

<script>
import CategoryListItem from './CategoryListItem.vue'
import CategoryListChild from './CategoryListChild.vue'

export default {
  components: { CategoryListItem, CategoryListChild },

  props: {
    categories: {
      type: Array,
      required: true
    },
    children: {
      type: Boolean,
      default: false
    },
    isToogleCategories: {
      type: Array
    },
    isSearch: {
      type: Boolean
    },
    activeCategory: {
      type: Object
    }
  },

  methods: {
    setCategory(id) {
      this.$emit('setCategory', id)
    },
    toogleCategory(id) {
      this.$emit('toogleCategory', id)
    }
  }
}
</script>
