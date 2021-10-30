<script>
import { computed, useContext } from '@nuxtjs/composition-api'

export default {
  props: {
    activeItemId: { type: String, default: null },
    category: { type: Object, required: true },
    id: { type: String, required: true },
    ui: { type: String, default: null }
  },

  setup ({ id, category }, { listeners }) {
    const { store } = useContext()

    const childCategoriesIds = computed(() => store.getters['categories/getChildCategoriesIds'](id))
    const parentCategory = computed(() => store.state.categories.items[category.parentId])

    function onClickItem () {
      if (listeners.onClick)
        listeners.onClick(id)
    }

    function onClickIcon () {
      if (listeners.onIconClick)
        listeners.onIconClick(id)
    }

    return {
      childCategoriesIds,
      parentCategory,
      onClickItem,
      onClickIcon
    }
  }
}
</script>

<template lang="pug">
.categoryItem(
  v-if="category"
  :class="{ [ui]: ui, _active: activeItemId === id }"
  @click="onClickItem"
)
  .categoryItem__active(v-if="activeItemId === id")
  .categoryItem__icon
    Icon(
      :category="true"
      :color="category.color || $store.state.ui.defaultBgColor"
      :icon="category.icon"
      small
      @click="handleIconClick"
    )

  .categoryItem__name(:class="{ _flat: ui === '_flat' }")
    .categoryItem__parent(v-if="ui === '_flat' && parentCategory") {{ parentCategory.name }}
    .categoryItem__child {{ category.name }}
    .categoryItem__length(v-if="childCategoriesIds.length > 0") {{ childCategoriesIds.length }}
</template>

<style lang="stylus" scoped>
@import '~assets/stylus/variables'

.categoryItem
  overflow hidden
  cursor pointer
  position relative
  display flex
  flex-flow row nowrap
  align-items center
  justify-content center
  min-height 48px
  padding $m6
  color var(--c-font-1)
  background var(--c-item-bg-main)
  border 1px solid transparent
  border-radius $m5
  anim()
  +media-hover()
    color var(--c-text-1)
    background var(--c-item-bg-hover)
    border 1px solid var(--c-item-bd-hover)
  &._active
    background var(--c-item-bg-hover)
    border 1px solid var(--c-item-bd-hover)

  &._flat
    flex-flow row
    align-items center
    justify-content center
    min-height inherit
    flex 1 1 auto
    padding $m6

  &:active
    opacity .9

  &__icon
    padding-right $m6

    +media(700px)
      padding-right $m8

    ^[0]._flat &
      padding-right $m5
      padding-bottom 0

  &__name
    overflow hidden
    display flex
    flex-grow 1
    text-overflow ellipsis
    padding-right 0
    font-size 14px

    ^[0]._flat &
      display block
      flex-grow 1
      min-height inherit

    &:last-child
      padding-bottom 0

  &__length
    margin-left auto
    padding-left $m6
    color var(--c-font-4)
    font-size 12px

    ^[0]._flat &
      text-align left

  &__parent
    padding-bottom $m3
    color var(--c-font-4)
    font-size 12px
    text-align center

    ^[0]._flat &
      text-align left

  &__child
    color var(--c-font-1)
    font-size 14px
    text-align center

    /.light-mode &
      color var(--c-font-4)

    ^[0]._flat &
      text-align left

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
