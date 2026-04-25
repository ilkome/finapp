<script setup lang="ts">
import type { CategoryItem } from '~/components/categories/types'

import { navigateToAncestor } from '~/composables/useNavigationHistory'

const props = defineProps<{
  category: CategoryItem
  parentCategory?: CategoryItem
}>()

const router = useRouter()

function onParentClick(event: Event) {
  // preventDefault stops the vue-router NuxtLink guard via its defaultPrevented check.
  event.preventDefault()
  navigateToAncestor(router, `/categories/${props.category.parentId}`)
}
</script>

<template>
  <UiHeaderTitle>
    <div class="flex min-w-0 items-center">
      <template v-if="props.parentCategory">
        <NuxtLink
          :to="`/categories/${props.category.parentId}`"
          class="text-muted truncate text-lg font-medium no-underline hover:text-(--ui-text-highlighted) @lg:text-xl"
          @click="onParentClick"
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
