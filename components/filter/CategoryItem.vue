<script setup lang="ts">
import type { CategoryId } from '~/components/categories/types'
import { useCategoriesStore } from '~/components/categories/useCategories'

defineProps<{
  categoryId: CategoryId
}>()

const emit = defineEmits<{
  (e: 'click', categoryId: CategoryId): void
}>()

const categoriesStore = useCategoriesStore()
</script>

<template>
  <FilterItemBg @click="emit('click', categoryId)">
    <div
      :style="{ color: categoriesStore.items[categoryId].color }"
      :class="categoriesStore.items[categoryId].icon"
      class="text-2xl"
    />

    <div>
      <div v-if="categoriesStore.items[categoryId].parentId" class="text-2xs">
        {{
          categoriesStore.items[categoriesStore.items[categoryId].parentId].name
        }}
      </div>
      <div class="text-secondary text-sm leading-none">
        {{ categoriesStore.items[categoryId].name }}
      </div>
    </div>
  </FilterItemBg>
</template>
