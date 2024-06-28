<script setup lang="ts">
import { getPreparedFormData } from '~/components/categories/getForm'
import { getParentCategory } from '~/components/categories/getCategories'
import { useCategoriesStore } from '~/components/categories/useCategories'

const emit = defineEmits(['afterSave'])
const { t } = useI18n()
const categoriesStore = useCategoriesStore()
const categoryForm = ref(getPreparedFormData())
const parentCategory = computed(() =>
  getParentCategory(categoriesStore.items, categoryForm.value.parentId))

const updateValue = (id, value) => categoryForm.value[id] = value
const afterSave = () => emit('afterSave')

useHead({
  title: () => `${t('base.add')}:
    ${categoryForm.value?.name
      ? categoryForm.value?.name
      : t('categories.form.name.label')}`,
})
</script>

<template>
  <UiPage>
    <UiHeader>
      <UiHeaderTitle2>
        <div class="pt-1 text-xs font-medium text-item-2">
          {{ $t('categories.createNewTitle') }}
          <template v-if="parentCategory">
            |
            {{ $t('common.in') }} {{ parentCategory.name }}
          </template>
        </div>
        <div class="pb-1 flex items-center gap-4">
          {{ categoryForm.name ? categoryForm.name : $t("categories.form.name.label") }}
          <div class="w-8 h-8 rounded-full flex-center text-xl text-icon-primary" :style="{ background: categoryForm.color }">
            <div :class="categoryForm.icon" />
          </div>
        </div>
      </UiHeaderTitle2>
    </UiHeader>

    <div class="pb-12">
      <CategoriesForm
        :categoryForm="categoryForm"
        @updateValue="updateValue"
        @afterSave="afterSave"
      />
    </div>
  </UiPage>
</template>
