<script setup lang="ts">
import type { CategoryItem } from '~/components/categories/types'

import { navigateToAncestor } from '~/composables/useNavigationHistory'

const props = defineProps<{
  category: CategoryItem
  parentCategory?: CategoryItem
}>()

const router = useRouter()

function onParentClick(event: Event) {
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
          class="truncate text-lg font-medium text-muted no-underline hover:text-highlighted @lg:text-xl"
          @click="onParentClick"
        >
          {{ props.parentCategory.name }}
        </NuxtLink>

        <span class="mx-1 text-lg text-muted @lg:text-xl">/</span>
      </template>

      <span class="truncate">
        {{ props.category.name }}
      </span>
    </div>
  </UiHeaderTitle>
</template>
