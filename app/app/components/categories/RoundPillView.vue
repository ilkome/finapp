<script setup lang="ts">
import type { CategoryItem } from '~/components/categories/types'

const props = defineProps<{
  category: CategoryItem
  isActive?: boolean
  isIconBg?: boolean
  isInlineContent?: boolean
  isShowParent?: boolean
  nameSuffix?: string
  parentCategory?: CategoryItem
}>()
</script>

<template>
  <div
    class="relative flex items-center overflow-hidden rounded-2xl border bg-elevated/10 p-1 pr-3 hover:bg-elevated/30"
    :class="[
      props.isIconBg ? 'gap-2' : 'gap-1',
      props.isActive ? 'border-primary/60 bg-elevated/30' : 'border-transparent',
    ]"
  >
    <div
      :style="{ backgroundColor: props.category.color }"
      class="absolute inset-0 size-full opacity-10"
    />

    <div class="relative size-6">
      <UiIconBase
        v-if="props.isIconBg"
        :name="props.category.icon"
        :color="props.category.color"
        :size="14"
        class="w-6! p-1"
        invert
      />
      <UiIconBase
        v-else
        :name="props.category.icon"
        :color="props.category.color"
        :size="14"
        class="w-6! p-1"
      />
    </div>

    <div
      class="relative"
      :class="props.isInlineContent && 'flex items-center gap-1.5'"
    >
      <CategoriesName
        :category="props.category"
        :isShowParent="props.isShowParent"
        :parentCategory="props.parentCategory"
        :stacked="!props.isInlineContent"
        :suffix="props.nameSuffix"
        size="xs"
      />
      <slot />
    </div>
  </div>
</template>
