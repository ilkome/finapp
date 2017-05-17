<template lang="pug">
.content
  .module
    h1.title Categories

    .table
      .table__cell
        input(type="text", v-model.trim="filter", placeholder="Filter").filterBtn

        .categories
          .categoryItem(
            v-for="category in categoriesList",
            :key="category.id")
            .categoryItem__content
              router-link(:to="`/categories/${category.id}`").categoryItem__icon: .icon(:class="`icon-${category.id}`"): .icon__pic
              router-link(:to="`/categories/${category.id}`").categoryItem__name {{ category.name }}
              .categoryItem__action(@click.prevent="setEditedCategory(category.id)") Edit

            template(v-if="editedCategory === category.id")
              CategoryEdit(:category="category")

            template(v-if="category.children.length > 0")
              .categoryItem__children
                .categoryItem(
                  v-for="childrenCategory in category.children",
                  :key="childrenCategory.id")
                  .categoryItem__content
                    router-link(:to="`/categories/${childrenCategory.id}`").categoryItem__icon: .icon(:class="`icon-${childrenCategory.id}`"): .icon__pic
                    router-link(:to="`/categories/${childrenCategory.id}`").categoryItem__name {{ childrenCategory.name }}
                    .categoryItem__action(@click.prevent="setEditedCategory(childrenCategory.id)") Edit

                  template(v-if="editedCategory === childrenCategory.id")
                    CategoryEdit(:category="childrenCategory")

      .table__cell
        .categoriesIcons
          .categoriesIcons__el(v-for="category in categoriesList", :key="category.id")
            router-link.icon(
              :to="`/categories/${category.id}`",
              :class="`icon-${category.id}`",
              :title="category.name"): .icon__pic
</template>

<script>
import { mapGetters } from 'vuex'
import CategoryEdit from './CategoryEdit.vue'

export default {
  data() {
    return {
      filter: '',
      editedCategory: false
    }
  },

  computed: {
    ...mapGetters(['categories']),

    categoriesList() {
      const categories = this.categories.filter(c =>
        c.name.toLowerCase().search(this.filter.toLowerCase()) !== -1
      )

      const sortedCategories = []

      const rootCategories = categories.filter(c => c.parentId === 0)

      rootCategories.forEach((category) => {
        const childrenCategories = categories.filter(c => c.parentId === category.id)

        if (childrenCategories) {
          sortedCategories.push({
            ...category,
            children: childrenCategories
          })
        } else {
          sortedCategories.push({ ...category })
        }
      })

      return sortedCategories
    }
  },

  methods: {
    setEditedCategory(categoryId) {
      if (this.editedCategory === +categoryId) this.editedCategory = false
      else this.editedCategory = categoryId
    }
  },

  components: { CategoryEdit }
}
</script>
