<script setup lang="ts">
import type { CategoryItem } from '~/components/categories/types'

const props = defineProps<{
  category: CategoryItem
  childrenCount?: number
  isShowParent?: boolean
  parentCategory?: CategoryItem
  size?: 'default' | 'xs'
  stacked?: boolean
}>()

const hasChildren = computed(() => (props.childrenCount ?? 0) > 0)

const nameClass = computed(() =>
  props.size === 'xs'
    ? 'text-xs leading-none text-nowrap'
    : 'text-toned text-sm leading-none font-medium tracking-wide text-nowrap',
)
</script>

<template>
  <div :class="cn('flex gap-3 items-baseline pt-0', props.stacked && 'flex-col gap-0.5')">
    <div class="flex items-center gap-2" :class="[nameClass]">
      {{ props.category?.name }}

      <div
        v-if="hasChildren && childrenCount"
        class="text-4"
      >
        {{ childrenCount }}
      </div>
    </div>

    <template v-if="stacked && isShowParent && !hasChildren && props.category?.parentId">
      <div class="text-2xs text-4 leading-none">
        {{ props.parentCategory?.name }}
      </div>
    </template>

    <template v-if="!stacked && isShowParent && !hasChildren && props.category?.parentId">
      <div class="text-2xs text-4 leading-none text-nowrap">
        •
      </div>

      <div class="text-2xs text-4 leading-none">
        {{ props.parentCategory?.name }}
      </div>
    </template>
  </div>
</template>
