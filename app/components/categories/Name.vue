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
    ? 'text-xs leading-none'
    : 'text-toned text-sm leading-none font-medium tracking-wide',
)
</script>

<template>
  <div :class="cn('flex gap-3 items-baseline pt-0 min-w-0', props.stacked && 'flex-col gap-0.5')">
    <div class="flex min-w-0 items-center gap-2" :class="[nameClass]">
      <span class="truncate">{{ props.category?.name }}</span>

      <div
        v-if="hasChildren && childrenCount"
        class="text-4 shrink-0"
      >
        {{ childrenCount }}
      </div>
    </div>

    <template v-if="stacked && isShowParent && !hasChildren && props.category?.parentId">
      <div class="text-2xs text-4 truncate leading-none">
        {{ props.parentCategory?.name }}
      </div>
    </template>

    <template v-if="!stacked && isShowParent && !hasChildren && props.category?.parentId">
      <div class="text-2xs text-4 shrink-0 leading-none">
        •
      </div>

      <div class="text-2xs text-4 truncate leading-none">
        {{ props.parentCategory?.name }}
      </div>
    </template>
  </div>
</template>
