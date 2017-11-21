<template lang="pug">
.leftBar
  //- PC
  template(v-if="!$store.state.isMobile")
    .leftBar__title(@click="$store.commit('toogleCategoriesList')")
      div Categories
      .sidebar__close__icon: .fa.fa-plus

  //- Mobile
  template(v-if="$store.state.isMobile")
    .sidebar__close(@click="$store.commit('toogleCategoriesList', 'hide')")
      .sidebar__close__title: .fa.fa-arrow-left
      .sidebar__close__title Categories
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
