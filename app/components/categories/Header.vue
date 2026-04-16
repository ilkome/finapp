<script setup lang="ts">
import type { CategoryItem } from '~/components/categories/types'

const props = defineProps<{
  category: CategoryItem
  parentCategory?: CategoryItem
}>()
</script>

<template>
  <UiHeaderTitle>
    <div class="flex min-w-0 items-center">
      <template v-if="props.parentCategory">
        <NuxtLink
          :to="`/categories/${props.category.parentId}`"
          class="text-muted truncate text-lg font-medium no-underline hover:text-(--ui-text-highlighted) @lg:text-xl"
        >
          {{ props.parentCategory.name }}
        </NuxtLink>

        <span class="text-4 mx-1 text-lg @lg:text-xl">/</span>
      </template>

      <span class="truncate">
        {{ props.category.name }}
      </span>
    </div>
  </UiHeaderTitle>
</template>
