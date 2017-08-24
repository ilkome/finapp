<template lang="pug">
.content
  .module
    .module-in
      h1.title Categories

      .gridTable
        .gridTable__item
          CategoryList(:isShowEditActions.sync="isShowEditActions")

        .gridTable__item
          CategoryCreate

          .panel._mb
            ul
              li: a.link(href="http://fontawesome.io/icons/", target="_blank") Fontawesome icons
              li: a.link(href="https://materialdesignicons.com/", target="_blank") Material Design Icons

          .panel._mb
            .categoriesIcons
              .categoriesIcons__el(v-for="category in sortedCategories", :key="category.id")
                router-link(:to="`/categories/${category.id}`").categoryItem__icon
                  .icon(:style="`background: ${category.color}`")
                    .icon__pic
                      template(v-if="category.icon")
                        .fa(:class="category.icon")
                      template(v-else)
                        .fa.fa-industry
                    .icon__label {{ category.name }}
</template>

<script>
import { mapGetters } from 'vuex'
import orderBy from 'lodash/orderBy'
import CategoryCreate from './categories/CategoryCreate.vue'
import CategoryList from './categories/CategoryList.vue'

export default {
  components: { CategoryCreate, CategoryList },

  data() {
    return {
      isShowEditActions: true
    }
  },

  computed: {
    ...mapGetters(['trns', 'categories']),

    sortedCategories() {
      return orderBy(this.categories, c => c.parentId, 'asc')
    }
  }
}
</script>
