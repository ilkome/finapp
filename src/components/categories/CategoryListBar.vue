<template lang="pug">
.rightBar
  .rightBar__in
    .rightBar__main

      template(v-if="$store.state.categories.list")
        .trnFormToogle(
          @click.prevent.stop="$store.commit('toogleCategoriesList', 'hide')",
          :class="{_active: $store.state.categories.list}"
        ): .trnFormToogle__icon: .trnFormToogle__icon__in +

      .rightBar__main__in
        .sidebar__close(@click="$store.commit('toogleCategoriesList', 'hide')")
          .sidebar__close__name Categories
          .sidebar__close__icon: .fa.fa-plus

        CategoryList(:isShowEditActions.sync="isShowEditActions")
</template>

<script>
import CategoryList from './CategoryList.vue'

export default {
  components: { CategoryList },

  data() {
    return {
      isShowEditActions: true
    }
  }
}
</script>
