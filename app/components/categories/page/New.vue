<script setup lang="ts">
import type { CategoryId } from '~/components/categories/types'
import { getPreparedFormData } from '~/components/categories/getForm'
import { getParentCategory } from '~/components/categories/getCategories'
import { useCategoriesStore } from '~/components/categories/useCategoriesStore'

const { t } = useI18n()
const router = useRouter()
const categoriesStore = useCategoriesStore()

const categoryForm = ref(getPreparedFormData())
const parentCategory = computed(() => getParentCategory(categoriesStore.items, categoryForm.value.parentId))

function updateValue(id: CategoryId, value: unknown) {
  return categoryForm.value[id] = value
}

function afterSave() {
  return router.replace('/categories/')
}

useHead({
  title: `${t('base.add')}: ${categoryForm.value.name ? categoryForm.value.name : t('categories.form.name.label')}`,
})
</script>

<template>
  <UiPage class="flex h-full flex-col">
    <UiHeader>
      <RouterLink
        v-slot="{ href, navigate }"
        to="/categories"
        custom
      >
        <a
          class="hocus:bg-item-5 -mx-2 grow px-2"
          :href="href"
          @click="navigate"
        >
          <UiHeaderTitle>
            <div class="text-item-2 pb-1 text-xs font-medium">
              {{ t('categories.createNewTitle') }}
              <template v-if="parentCategory">
                {{ t('common.in') }} {{ parentCategory.name }}
              </template>
            </div>

            <div class="flex items-center gap-4 pb-1">
              <div class="text-item-1 text-2xl font-semibold">
                {{ categoryForm.name ? categoryForm.name : t("categories.form.name.label") }}
              </div>

              <div
                class="flex-center text-icon-primary size-8 rounded-full text-xl"
                :style="{ background: categoryForm.color }"
              >
                <div :class="categoryForm.icon" />
              </div>
            </div>
          </UiHeaderTitle>
        </a>
      </RouterLink>
    </UiHeader>

    <CategoriesForm
      :categoryForm="categoryForm"
      @updateValue="updateValue"
      @afterSave="afterSave"
    />
  </UiPage>
</template>
