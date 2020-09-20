<script>
export default {
  name: 'TrnFormHeaderItemCategory',

  computed: {
    category () {
      const categoryId = this.$store.state.trnForm.values.categoryId
      return this.$store.state.categories.items[categoryId]
    },

    parentCategory () {
      return this.$store.state.categories.items[this.category.parentId]
    }
  }
}
</script>

<template lang="pug">
.trnFormHeaderItem._category(
  v-if="category"
  :style="{ background: category.color || $store.state.ui.defaultBgColor }"
  @click="$store.commit('trnForm/toogleTrnFormModal', 'categories')"
)
  .trnFormHeaderItem__in
    transition(name="slide")
      .trnFormHeaderItem__icon(
        v-show="true"
        :key="category.icon"
      )
        Icon(:icon="category.icon")
    .trnFormHeaderItem__name
      .parent(v-if="parentCategory") {{ parentCategory.name }}
      .child {{ category.name }}
  .trnFormHeaderItem__dots: .mdi.mdi-dots-vertical
</template>

<style lang="stylus" scoped>
//
</style>
