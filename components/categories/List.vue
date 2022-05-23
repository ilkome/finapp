<script>
export default {
  props: {
    activeItemId: { type: String, default: null },
    ids: { type: Array, required: true },
    isHideParentCategory: { type: Boolean, default: false },
    slider: { type: Object, required: true },
  },

  computed: {
    categoriesIds() {
      if (this.limit)
        return this.ids.slice(0, this.limit)

      return this.ids
    },
  },
}
</script>

<template lang="pug">
.grid.gap-y-1.gap-x-1.3sm_grid-cols-2.sm_gap-x-6
  CategoriesItem(
    v-for="categoryId in categoriesIds"
    :category="$store.state.categories.items[categoryId]"
    :activeItemId="activeItemId"
    :id="categoryId"
    :key="categoryId"
    :slider="slider"
    :isHideParentCategory="isHideParentCategory"
    v-on="$listeners"
  )
</template>
