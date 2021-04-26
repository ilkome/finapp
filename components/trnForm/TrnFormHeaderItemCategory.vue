<script>
export default {
  // TODO: add check for valid category

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
  :style="{ background: category.color }"
  @click="$store.commit('trnForm/showTrnFormModal', 'categories')"
)
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
@import "~assets/stylus/variables"

.trnFormHeaderItem
  &._category
    display flex
    align-items center
    padding $m5 $m6
    background var(--c-bg-3)

  .trnFormHeaderItem__icon
    padding-right $m4

  .trnFormHeaderItem__name
    flex-grow 1
    color var(--c-font-1)
    text-align left

    .parent
      opacity .8
      padding-bottom $m2
      color var(--c-font-1)
      font-size 12px

    .child
      font-size 16px
</style>
