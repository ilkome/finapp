<script>
import useFilter from '~/modules/filter/useFilter'

export default defineComponent({
  props: {
    activeItemId: { type: String, default: null },
    category: { type: Object, required: true },
    id: { type: String, required: true },
    ui: { type: String, default: null },
  },

  setup({ id, category }, { listeners }) {
    const { $store } = useNuxtApp()

    const { setCategoryFilter } = useFilter()

    const childCategoriesIds = computed(() => $store.getters['categories/getChildCategoriesIds'](id))
    const parentCategory = computed(() => $store.state.categories.items[category.parentId])

    function onClickItem() {
      if (listeners.onClick)
        listeners.onClick(id)
    }

    function onClickIcon() {
      setCategoryFilter(id)
      $store.commit('filter/setFilterDateNow')
      $store.commit('categories/hideCategoryModal')
      $store.commit('categories/setCategoryModalId', null)
      $store.dispatch('ui/setActiveTabStat', 'details')
    }

    return {
      childCategoriesIds,
      parentCategory,
      onClickItem,
      onClickIcon,
    }
  },
})
</script>

<template lang="pug">
.categoryItem.bg-main.p-2.gap-x-3.items-center.flex.rounded-md(
  v-if="category"
  :class="{ [ui]: ui, _active: activeItemId === id }"
  @click="onClickItem"
)
  .categoryItem__active(v-if="activeItemId === id")
  .text-neutral-50.text-xl.leading-none.w-8.h-8.rounded-full.justify-center.items-center.flex(
    :style="{ background: category.color }"
    @click.stop="onClickIcon"
  ): div(:class="category.icon")

  .categoryItem__name.grow.truncate
    .text-xs.text-neutral-500(
      v-if="parentCategory"
      class="dark:text-neutral-400"
    ) {{ parentCategory.name }}

    .leading-none.text-sm.text-neutral-700(class="dark:text-neutral-300") {{ category.name }}

  .text-md.text-neutral-500(
    v-if="childCategoriesIds.length > 0"
    class="dark:text-neutral-400"
  ) {{ childCategoriesIds.length }}
</template>

<style lang="stylus" scoped>
.bg-main
  background var(--c-item-bg-main)
  +media-hover()
    background var(--c-item-bg-hover)
  &._active
    background var(--c-item-bg-hover)

.categoryItem
  overflow hidden
  cursor pointer
  position relative
  color var(--c-font-1)

  &__length
    color var(--c-font-4)

  &__parent
    color var(--c-font-4)

  &__child
    color var(--c-font-1)

    /.light &
      color var(--c-font-4)

  &__active
    position absolute
    top $m5
    right $m5
    display flex
    align-items center
    justify-content center
    width 8px
    height 8px
    background var(--c-blue-1)
    border-radius 50%
</style>
