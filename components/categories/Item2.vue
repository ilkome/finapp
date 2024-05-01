<script setup lang="ts">
import type { CategoryId } from '~/components/categories/types'
import { useCategoriesStore } from '~/components/categories/useCategories'
import { getStyles } from '~/components/ui/getStyles'

defineProps<{
  categoryId: CategoryId
}>()

const emit = defineEmits<{
  click: [categoryId: CategoryId]
  filter: [categoryId: CategoryId]
}>()

const categoriesStore = useCategoriesStore()
</script>

<template>
  <div
    :class="getStyles('item', ['link', 'center', 'gap1', 'rounded', 'padding2', 'minh'])"
    @click="emit('click', categoryId)"
  >
    <template
      v-if="categoriesStore.items[categoryId]"
    >
      <div
        :class="categoriesStore.items[categoryId].icon"
        :style="{ color: categoriesStore.items[categoryId].color }"
        class="text-2xl"
        @click="emit('filter', categoryId)"
      />

      <div>
        <div
          v-if="categoriesStore.items[categoryId].parentId"
          class="text-2xs"
        >
          {{ categoriesStore.items[categoriesStore.items[categoryId].parentId].name }}
        </div>

        <div class="text-secondary text-sm leading-none">
          {{ categoriesStore.items[categoryId].name }}
        </div>
      </div>
    </template>
  </div>
</template>
