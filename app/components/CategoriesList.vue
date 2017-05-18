<template lang="pug">
.content
  .module
    h1.title Categories

    .table
      .table__cell
        input(type="text", v-model.trim="filter", placeholder="Filter" v-focus="true").filterBtn

        .categories
          .categoryItem(
            v-for="category in categoriesList",
            :key="category.id",
            :class="{_editable: editedCategory === category.id}")
            .categoryItem__content
              router-link(:to="`/categories/${category.id}`").categoryItem__icon: .icon(:class="`icon-${category.id}`"): .icon__pic
              router-link(:to="`/categories/${category.id}`").categoryItem__name {{ category.name }}
              template(v-if="editedCategory === category.id")
                .categoryItem__action(@click.prevent="setEditedCategory(category.id)"): .fa.fa-times-circle
              template(v-else)
                .categoryItem__action(@click.prevent="setEditedCategory(category.id)"): .fa.fa-pencil-square-o
              .categoryItem__action(@click.prevent="setEditedCategory(category.id)"): .fa.fa-trash-o

            template(v-if="editedCategory === category.id")
              .categoryItem__edit
                .form
                  .input
                    input.input__field(
                      v-model.lazy="values.name = category.name",
                      type="text" name="name")
                  .btn(@click="updateCategory(category, values)") Update

            //- template(v-if="category.children")
            //-   .categoryItem__children
            //-     .categoryItem(
            //-       v-for="childrenCategory in category.children",
            //-       :key="childrenCategory.id")
            //-       .categoryItem__content
            //-         router-link(:to="`/categories/${childrenCategory.id}`").categoryItem__icon: .icon(:class="`icon-${childrenCategory.id}`"): .icon__pic
            //-         router-link(:to="`/categories/${childrenCategory.id}`").categoryItem__name {{ childrenCategory.name }}
            //-         .categoryItem__action(@click.prevent="setEditedCategory(childrenCategory.id)"): .fa.fa-pencil-square-o
            //-         .categoryItem__action(@click.prevent="setEditedCategory(childrenCategory.id)"): .fa.fa-trash-o
            //-
            //-       template(v-if="editedCategory === childrenCategory.id")

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
import { mixin } from 'vue-focus'

export default {

  mixins: [ mixin ],

  data() {
    return {
      filter: '',
      editedCategory: false,
      values: {
        name: null
      }
    }
  },

  computed: {
    ...mapGetters(['categories']),

    categoriesList() {
      const sortedCategories = []
      let filteredCategories = []

      if (this.filter !== '') {
        filteredCategories = this.categories
          .filter(c => c.name.toLowerCase().search(this.filter.toLowerCase()) !== -1)
      } else {
        filteredCategories = this.categories
      }

      const rootCategories = filteredCategories.filter(c => c.parentId === 0)

      rootCategories.forEach((category) => {
        const childrenCategories = filteredCategories.filter(c => c.parentId === category.id)

        if (childrenCategories && childrenCategories.length > 0) {
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
    },

    async updateCategory(category, values) {
      const updatedCategory = {
        ...category,
        ...values
      }
      const status = await this.$store.dispatch('updateCategory', updatedCategory)
      if (status) {
        this.editedCategory = false
      }
    }
  }
}
</script>
