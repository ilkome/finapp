<script>
export default {
  props: {
    activeItemId: { type: String, default: null },
    ids: { type: Array, required: true },
    isHideParentCategory: { type: Boolean, default: false },
    slider: { type: Object, required: true },
  },

  computed: {
    categoresIds() {
      if (this.limit)
        return this.ids.slice(0, this.limit)

      return this.ids
    },
  },
}
</script>

<template lang="pug">
.grid.gap-y-1.gap-x-2.3sm_grid-cols-2.sm_gap-x-6
  CategoriesItem(
    v-for="categoryId in categoresIds"
    :category="$store.state.categories.items[categoryId]"
    :activeItemId="activeItemId"
    :id="categoryId"
    :key="categoryId"
    :slider="slider"
    :isHideParentCategory="isHideParentCategory"
    v-on="$listeners"
  )
</template>
