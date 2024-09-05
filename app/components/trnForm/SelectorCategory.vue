<script setup lang="ts">
import { useCategoriesStore } from '~/components/categories/useCategories'
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

const categoriesStore = useCategoriesStore()
</script>

<template>
  <div>
    <div v-if="!isLaptop">
      <CategoriesItem
        :category
        :categoryId
        alt
        insideClasses="bg-item-4 min-h-[46px] py-2"
        @click="emit('onOpen', 2)"
      />
    </div>

    <VDropdown
      v-else
      :overflowPadding="12"
      autoBoundaryMaxSize
      placement="top-start"
    >
      <CategoriesItem
        :category
        :categoryId
        :hasChildren="categoriesStore.getChildsIds(categoryId).length > 0"
        insideClasses="bg-item-4 min-h-[46px] py-2"
      />

      <template #popper="{ hide }">
        <div class="z-10 sticky py-3 px-3 top-0 flex items-center bg-foreground-1">
          <UiTitle>
            {{ $t("categories.title") }}
          </UiTitle>

          <BaseBottomSheetClose @onClick="hide" />
        </div>

        <CategoriesSelector
          :hide
          class="min-w-72 max-w-xs"
          @onSelected="id => emit('onSelected', id)"
        />
      </template>
    </VDropdown>
  </div>
</template>
