<template lang="pug">
.sidebar(
  :class="{ _active: $store.state.categories.list }"
)
  .sidebar__overlay(
    @click="$store.commit('toogleCategoriesList', 'hide')"
  )

  //- PC
  .sidebar__block
    template(v-if="!$store.state.isMobile")
      .leftBar__title(@click="$store.commit('toogleCategoriesList')")
        div Categories
        .sidebar__close-icon: .mdi.mdi-plus

    //- Mobile
    template(v-if="$store.state.isMobile")
      .sidebar__close(@click="$store.commit('toogleCategoriesList', 'hide')")
        .sidebar__close-title Categories

    CategoryList
</template>

<script>
import CategoryList from './CategoryList.vue'

export default {
  components: { CategoryList }
}
</script>
