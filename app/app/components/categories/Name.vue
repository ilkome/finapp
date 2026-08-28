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
</script>

<template>
  <div :class="cn('flex min-w-0 items-baseline gap-3 pt-0', props.stacked && 'flex-col gap-0.5')">
    <div class="flex min-w-0 items-center gap-2">
      <UiEntityName :variant="props.size === 'xs' ? 'compact' : 'primary'">
        {{ props.category?.name }}
      </UiEntityName>

      <div
        v-if="hasChildren && childrenCount"
        class="shrink-0 text-muted"
      >
        {{ childrenCount }}
      </div>
    </div>

    <template v-if="isShowParent && !hasChildren && props.category?.parentId">
      <UiEntityName variant="secondary">
        {{ props.parentCategory?.name }}
      </UiEntityName>
    </template>
  </div>
</template>
