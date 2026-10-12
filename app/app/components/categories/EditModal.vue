<script setup lang="ts">
import type { CategoryId, CategoryItem } from '~/components/categories/types'

import { categoryFormSchema } from '~/components/categories/types'
import { useCategoriesStore } from '~/components/categories/useCategoriesStore'

const props = defineProps<{
  categoryId?: CategoryId
}>()

const emit = defineEmits<{
  closed: []
}>()

const { t } = useI18n()
// vueuse types a binding as a prop option, so a function type must stay `any`.
const [DefineBody, ReuseBody] = createReusableTemplate<{ close: any }>()
const isLaptop = useIsLaptop()
const categoriesStore = useCategoriesStore()

const category = computed(() =>
  props.categoryId ? categoriesStore.items[props.categoryId] : undefined,
)
const categoryForm = ref(categoryFormSchema.parse(category.value ?? {}))
</script>

<template>
  <DefineBody v-slot="{ close }">
    <CategoriesForm
      :categoryId="props.categoryId"
      :categoryForm="categoryForm"
      @update="(key: string, value: CategoryItem[keyof CategoryItem]) => (categoryForm as Record<string, any>)[key] = value"
      @afterSave="close"
    />
  </DefineBody>

  <UModal
    v-if="isLaptop"
    defaultOpen
    :title="category?.name || t('categories.createNewTitle')"
    :ui="{ content: 'max-w-lg' }"
    @after:leave="emit('closed')"
  >
    <template #body="{ close }">
      <ReuseBody :close />
    </template>
  </UModal>

  <Drawer
    v-else
    :title="category?.name || t('categories.createNewTitle')"
    contentClass="min-h-[50dvh]"
    @closed="emit('closed')"
  >
    <template #default="{ close }">
      <ReuseBody :close />
    </template>
  </Drawer>
</template>
