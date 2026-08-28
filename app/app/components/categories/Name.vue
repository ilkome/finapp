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
  <div :class="cn('flex min-w-0 items-baseline gap-3 pt-0', props.stacked && 'flex-col gap-0.5')">
    <div class="flex min-w-0 items-center gap-2" :class="[nameClass]">
      <span class="truncate">{{ props.category?.name }}</span>

      <div
        v-if="hasChildren && childrenCount"
        class="shrink-0 text-muted"
      >
        {{ childrenCount }}
      </div>
    </div>

    <template v-if="isShowParent && !hasChildren && props.category?.parentId">
      <div class="truncate text-2xs leading-none text-muted">
        {{ props.parentCategory?.name }}
      </div>
    </template>
  </div>
</template>
