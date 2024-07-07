<script setup lang="ts">
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
</script>

<template>
  <div>
    <div v-if="!isLaptop">
      <CategoriesItem
        :category
        :categoryId
        alt
        insideClasses="bg-item-4"
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
        alt
        class="bg-item-4"
      />

      <template #popper="{ hide }">
        <div class="z-10 sticky py-3 px-3 top-0 flex items-center bg-foreground-3">
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
