<script setup lang="ts">
import type { CategoryId, CategoryItem } from '~/components/categories/types'

const props = defineProps<{
  category: CategoryItem
  categoryId?: CategoryId
  isEdit?: boolean
  parentCategory?: CategoryItem | false
}>()

const { t } = useI18n()
</script>

<template>
  <UiHeader>
    <RouterLink
      v-slot="{ href, navigate }"
      to="/categories"
      custom
    >
      <a
        class="hocus:bg-item-5 -mx-2 grow cursor-default overflow-hidden rounded-lg px-2"
        :href="href"
        @click="navigate"
      >
        <UiHeaderTitle>
          <div class="text-item-2 pb-1 text-xs font-medium">
            {{ props.isEdit ? t('base.edit') : t('categories.createNewTitle') }}
            <template v-if="props.parentCategory">
              {{ t('common.in') }} {{ props.parentCategory.name }}
            </template>
          </div>

          <div class="flex items-center gap-4 pb-1">
            <div
              class="flex-center text-icon-primary size-8 rounded-full text-xl"
              :style="{ background: props.category.color }"
            >
              <div :class="props.category.icon" />
            </div>
            <div class="text-item-1 text-2xl font-semibold">
              {{ props.category.name ? props.category.name : t("categories.form.name.label") }}
            </div>
          </div>
        </UiHeaderTitle>
      </a>
    </RouterLink>

    <template v-if="props.categoryId" #actions>
      <CategoriesDelete :categoryId="props.categoryId" />
    </template>
  </UiHeader>
</template>
