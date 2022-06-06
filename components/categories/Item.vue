<script setup lang="ts">
import type { CategoryID, CategoryItem } from '~/components/categories/types'
import useFilter from '~/components/filter/useFilter'

const props = defineProps<{
  activeItemId: string | 0
  category: CategoryItem
  id: CategoryID
  isHideParentCategory?: boolean
  slider: any
}>()
const emit = defineEmits(['onClick'])

const { $store } = useNuxtApp()
const { setFilterCatsId } = useFilter()
const childCategoriesIds = computed(() =>
  $store.getters['categories/getChildCategoriesIds'](props.id))

const parentCategory = computed(() => $store.state.categories.items[props.category?.parentId])
const onClickItem = () => emit('onClick', props.id)

function onClickIcon() {
  // Prevent filter when using in TrnForm
  if (props.slider) {
    onClickItem()
    return
  }

  // TODO: useFilter
  setFilterCatsId(props.id)
  $store.commit('filter/setFilterDateNow')
  $store.dispatch('ui/setActiveTabStat', 'details')
}
</script>

<template lang="pug">
.cursor-pointer.py-2.px-2.gap-x-3.flex.items-center.rounded-md.bg-skin-item-main-bg.hocus_bg-skin-item-main-hover(
  v-if="category"
  :class="{ '!cursor-default !bg-skin-item-main-active': activeItemId === id }"
  @click="onClickItem"
)
  .w-8.h-8.flex.items-center.justify-center.rounded-full.text-xl.leading-none.text-neutral-50(
    :style="{ background: category.color }"
    @click.stop="onClickIcon"
  ): div(:class="category.icon")

  .grow.truncate
    .text-xs.text-skin-item-base-down.dark_text-neutral-400(
      v-if="parentCategory && !isHideParentCategory"
    ) {{ parentCategory.name }}

    .leading-none.text-sm.text-skin-item-base {{ category.name }}

  .font-unica.text-md.text-skin-item-base-down(
    v-if="childCategoriesIds.length > 0"
  ) {{ childCategoriesIds.length }}
</template>
