<script setup lang="ts">
import type { CategoryId, CategoryItem } from '~/components/categories/types'
import useFilter from '~/components/filter/useFilter'

const props = defineProps<{
  activeItemId: string | 0
  category: CategoryItem
  id: CategoryId
  isHideParentCategory?: boolean
  slider: any
}>()

const emit = defineEmits<{
  (e: 'click', id: CategoryId): void
  (e: 'onClickIcon', id: CategoryId): void
}>()

const { $store } = useNuxtApp()
const router = useRouter()
const { setFilterCatsId } = useFilter()

const childCategoriesIds = computed(() =>
  $store.getters['categories/getChildCategoriesIds'](props.id))

const parentCategory = computed(() => $store.state.categories.items[props.category?.parentId])

function onClickIcon() {
  // Prevent filter when using in TrnForm
  if (props.slider)
    emit('click', props.id)

  emit('onClickIcon', props.id)
  // TODO: v4.1
  // router.push({
  //   path: 'stat',
  //   query: {
  //     cats: [props.id],
  //   },
  // })

  setFilterCatsId(props.id)
  $store.commit('filter/setFilterDateNow')
  $store.dispatch('ui/setActiveTabStat', 'details')
}
</script>

<template lang="pug">
.cursor-pointer.py-2.px-2.gap-x-3.flex.items-center.rounded-md.bg-item-main-bg.hocus_bg-item-main-hover(
  v-if="category"
  :class="{ '!cursor-default !bg-item-main-active': activeItemId === id }"
  @click="emit('click', id)"
)
  .w-8.h-8.flex.items-center.justify-center.rounded-full.text-xl.leading-none.text-neutral-50(
    :style="{ background: category.color }"
    @click.stop="onClickIcon"
  ): div(:class="category.icon")

  .grow.truncate
    .text-xs.text-item-base-down.dark_text-neutral-400(
      v-if="parentCategory && !isHideParentCategory"
    ) {{ parentCategory.name }}

    .leading-none.text-sm.text-item-base {{ category.name }}

  .font-unica.text-md.text-item-base-down(
    v-if="childCategoriesIds.length > 0"
  ) {{ childCategoriesIds.length }}
</template>
