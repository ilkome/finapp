<script setup lang="ts">
import { useCategoriesStore } from '~/components/categories/useCategoriesStore'
import type { CategoryId, CategoryItem } from '~/components/categories/types'

defineProps<{
  category: CategoryItem
  categoryId: CategoryId
  isLaptop: boolean
}>()

const emit = defineEmits<{
  onOpen: [slide: number]
  onSelected: [id: CategoryId]
}>()

const { t } = useI18n()
const categoriesStore = useCategoriesStore()
</script>

<template>
  <div>
    <div v-if="!isLaptop">
      <CategoriesItem
        :category
        :categoryId
        alt
        insideClasses="bg-item-4 min-h-[42px] py-2"
        @click="emit('onOpen', 2)"
      />
    </div>

    <UPopover v-else>
      <CategoriesItem
        :category
        :categoryId
        alt
        :hasChildren="categoriesStore.getChildsIds(categoryId).length > 0"
        insideClasses="bg-item-4 min-h-[42px] py-2"
      />

      <template #panel="{ close }">
        <UiPopoverWrap
          :title="t('categories.title')"
          @close="close"
        >
          <CategoriesSelector
            :hide="close"
            class="min-w-72 max-w-xs"
            @onSelected="id => { emit('onSelected', id); close() }"
          />
        </UiPopoverWrap>
      </template>
    </UPopover>
  </div>
</template>
