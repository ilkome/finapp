<script>
export default {
  props: {
    activeItemId: { type: String, default: null },
    ids: { type: Array, required: true },
    limit: { type: Number, default: null },
    noPadding: { type: Boolean, default: false },
    isHideParentCategory: { type: Boolean, default: false },
    noPaddingBottom: { type: Boolean, default: false },
    slider: { type: Object, required: true },
    title: { type: String, default: null },
    ui: { type: String, default: null },
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
.categories(:class="{ _noPadding: noPadding, _noPaddingBottom: noPaddingBottom, [ui]: ui }")
  .categories__title(v-if="title") {{ title }}

  .categories__list
    CategoriesItemCategoryItem(
      v-for="categoryId in categoresIds"
      :category="$store.state.categories.items[categoryId]"
      :activeItemId="activeItemId"
      :id="categoryId"
      :key="categoryId"
      :slider="slider"
      :isHideParentCategory="isHideParentCategory"
      :ui="ui"
      v-on="$listeners"
    )
</template>

<style lang="stylus" scoped>
.categories._flat
  overflow hidden
  padding 0
</style>
