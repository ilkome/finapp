<script setup lang="ts">
import type { ContextMenuItem } from '#ui/components/ContextMenu.vue'

import type { CategoryId } from '~/components/categories/types'

const props = defineProps<{
  categoryId: CategoryId
  contextMenuItems?: ContextMenuItem[][]
  to?: string
}>()

const emit = defineEmits<{
  click: []
}>()
</script>

<template>
  <UContextMenu v-if="props.contextMenuItems" :items="props.contextMenuItems">
    <NuxtLink
      :to="props.to"
      class="text-inherit no-underline"
      @click="emit('click')"
    >
      <CategoriesRoundPill :categoryId="props.categoryId" />
    </NuxtLink>
  </UContextMenu>

  <NuxtLink
    v-else
    :to="props.to"
    class="text-inherit no-underline"
    @click="emit('click')"
  >
    <CategoriesRoundPill :categoryId="props.categoryId" />
  </NuxtLink>
</template>
