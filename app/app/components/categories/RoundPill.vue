<script setup lang="ts">
import type { CategoryId } from '~/components/categories/types'

import { useCategoriesStore } from '~/components/categories/useCategoriesStore'

const props = defineProps<{
  categoryId: CategoryId
  isActive?: boolean
  isIconBg?: boolean
  isInlineContent?: boolean
  isShowParent?: boolean
  nameSuffix?: string
}>()

const categoriesStore = useCategoriesStore()
const withParent = computed(() => categoriesStore.getWithParent(props.categoryId))
</script>

<template>
  <CategoriesRoundPillView
    v-if="withParent"
    :category="withParent.category"
    :isActive="props.isActive"
    :isIconBg="props.isIconBg"
    :isInlineContent="props.isInlineContent"
    :isShowParent="props.isShowParent"
    :nameSuffix="props.nameSuffix"
    :parentCategory="withParent.parentCategory"
  >
    <slot />
  </CategoriesRoundPillView>
</template>
