<template lang="pug">
.content
  .module
    .module-in
      .mb40(v-if="$store.state.isMobile")
      h1.title Categories

      .gridTable
        .gridTable__item
          .mb20
            .btn(@click="$store.commit('toogleCategoryCreate')") Create category

          CategoryList(:isShowEditActions.sync="isShowEditActions")

        .gridTable__item
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
