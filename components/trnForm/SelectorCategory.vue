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
      />

      <template #popper="{ hide }">
        <!-- TODO: combine -->
        <div class="flex items-center">
          <UiTitle class="px-3 py-3">
            {{ $t("categories.title") }}
          </UiTitle>

          <BaseBottomSheetClose @onClick="hide" />
        </div>

        <CategoriesSelector
          :hide
          @onSelected="id => emit('onSelected', id)"
        />
      </template>
    </VDropdown>
  </div>
</template>
