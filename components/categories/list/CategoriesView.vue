<script>
export default {
  props: {
    ids: {
      type: Array,
      required: true
    },
    title: {
      type: String,
      default: null
    },
    limit: {
      type: Number,
      default: null
    },
    noPadding: {
      type: Boolean,
      default: false
    },
    noPaddingBottom: {
      type: Boolean,
      default: false
    },
    borderTop: {
      type: Boolean,
      default: false
    },
    ui: {
      type: String,
      default: null
    }
  },

  computed: {
    categoresIds () {
      if (this.limit) { return this.ids.slice(0, this.limit) }
      return this.ids
    }
  }
}
</script>

<template lang="pug">
.categories(:class="{ _noPadding: noPadding, _noPaddingBottom: noPaddingBottom, _borderTop: borderTop, [ui]: ui }")
  .categories__title(v-if="title") {{ title }}

  .categories__list
    CategoryItem(
      v-for="categoryId in categoresIds"
      :id="categoryId"
      :ui="ui"
      :key="categoryId"
      :category="$store.state.categories.items[categoryId]"
      v-on="$listeners"
    )
</template>

<style lang="stylus" scoped>
.categories._flat
  overflow hidden
  padding 0
  // overflow-x auto

  .categories__list
    display grid
    grid-template-columns repeat(auto-fit, minmax(100px, 1fr))
    grid-column-gap $m7
    grid-row-gap $m7
</style>
