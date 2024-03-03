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
const category = computed<CategoryItem>(() => categoriesStore.items[categoryId.value])
const categoryForm = ref(getPreparedFormData(category.value))
const parentCategory = computed(() =>
  getParentCategory(categoriesStore.items, categoryForm.value.parentId))

const updateValue = (id, value) => categoryForm.value[id] = value
const afterSave = () => router.replace(`/categories/${categoryId.value}`)

useHead({
  title: `${t('base.edit')}:
    ${categoryForm.value?.name
      ? categoryForm.value?.name
      : t('categories.form.name.label')}`,
})
</script>

<template lang="pug">
UiPage(v-if="category")
  UiHeader
    router-link(
      v-slot="{ href, navigate }"
      to="/categories"
      custom
    )
      a.grow.hocus_bg-item-main-hover(
        :href='href'
        @click='navigate'
      )
        UiHeaderTitle
          .pt-1.text-xs.font-medium.text-item-base-down
            | {{ $t('categories.title') }}
            template(v-if="parentCategory")
              |
              | {{ $t('common.in')}} {{ parentCategory.name }}

          .pb-1.flex.items-center.gap-4
            | {{ categoryForm.name }}
            .w-8.h-8.rounded-full.flex-center.text-xl.text-icon-base(
              :style="{ background: categoryForm.color }"
            )
              div(:class="categoryForm.icon")

    template(#actions)
      CategoriesDelete(:categoryId="categoryId")

  .mt-3
    CategoriesForm(
      :categoryId="categoryId"
      :categoryForm="categoryForm"
      @updateValue="updateValue"
      @afterSave="afterSave"
    )
</template>
