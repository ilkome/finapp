<script setup lang="ts">
import type { CategoryId, CategoryItem } from '~/components/categories/types'
import { getPreparedFormData } from '~/components/categories/getForm'
import { getParentCategory } from '~/components/categories/getCategories'
import { useCategoriesStore } from '~/components/categories/useCategories'

const { t } = useI18n()
const router = useRouter()
const route = useRoute()
const categoriesStore = useCategoriesStore()

const categoryId = computed<CategoryId>(() => route.params.id)
const category = computed<CategoryItem>(
  () => categoriesStore.items[categoryId.value],
)
const categoryForm = ref(getPreparedFormData(category.value))
const parentCategory = computed(() =>
  getParentCategory(categoriesStore.items, categoryForm.value.parentId),
)

const updateValue = (id, value) => (categoryForm.value[id] = value)
const afterSave = () => router.replace(`/categories/${categoryId.value}`)

useHead({
  title: `${t('base.edit')}:
    ${
      categoryForm.value?.name
        ? categoryForm.value?.name
        : t('categories.form.name.label')
    }`,
})
</script>

<template>
  <UiPage v-if="category">
    <UiHeader>
      <RouterLink v-slot="{ href, navigate }" to="/categories" custom>
        <a class="hocus:bg-item-5 grow" :href="href" @click="navigate">
          <UiHeaderTitle>
            <div class="pt-1 text-xs font-medium text-item-2">
              {{ $t("categories.title") }}
              <template v-if="parentCategory">
                |
                {{ $t("common.in") }} {{ parentCategory.name }}
              </template>
            </div>
            <div class="flex items-center gap-4 pb-1">
              {{ categoryForm.name }}
              <div
                class="flex-center h-8 w-8 rounded-full text-xl text-icon-primary"
                :style="{ background: categoryForm.color }"
              >
                <div :class="categoryForm.icon" />
              </div>
            </div>
          </UiHeaderTitle>
        </a>
      </RouterLink>

      <template #actions>
        <CategoriesDelete :categoryId="categoryId" />
      </template>
    </UiHeader>

    <div class="mt-3">
      <CategoriesForm
        :categoryId="categoryId"
        :categoryForm="categoryForm"
        @updateValue="updateValue"
        @afterSave="afterSave"
      />
    </div>
  </UiPage>
</template>
