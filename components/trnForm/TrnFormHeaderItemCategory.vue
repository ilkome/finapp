<script>
export default {
  // TODO: add check for valid category

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
.trnFormHeaderItem._category.gap-x-3.flex(
  v-if="category"
  @click="$store.commit('trnForm/showTrnFormModal', 'categories')"
)
  transition(name="slide2")
    .text-neutral-50.text-xl.leading-none.w-8.h-8.rounded-full.justify-center.items-center.flex(
      :style="{ background: category.color }"
      @click.stop="handleIconClick"
    ): div(:class="category.icon")

  .trnFormHeaderItem__name
    .text-xs.text-neutral-500(
      v-if="parentCategory"
      class="dark:text-neutral-400"
    ) {{ parentCategory.name }}
    .text-sm.text-neutral-700(class="dark:text-neutral-300") {{ category.name }}

  .trnFormHeaderItem__dots.text-neutral-500(
    class="dark:text-neutral-400"
  ): .mdi.mdi-dots-vertical
</template>

<style lang="stylus" scoped>
.trnFormHeaderItem
  +media-hover()
    transform scale(1.04)

  &._category
    display flex
    align-items center
    padding $m5 $m6
    background var(--c-item-bg-main)

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
