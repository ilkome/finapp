<script setup lang="ts">
import { useCategoriesStore } from '~/components/categories/useCategories'
import type { CategoryId } from '~/components/categories/types'

const route = useRoute()
const router = useRouter()
const categoriesStore = useCategoriesStore()

const categoryId = computed(() => route.params.id) as ComputedRef<CategoryId>
const category = computed(() => categoriesStore.items[categoryId.value])

if (!category.value)
  router.replace('/categories')

const backLink = computed(() =>
  category.value?.parentId
    ? `/categories/${category.value.parentId}`
    : '/categories',
)

const categoryChildIds = computed(() =>
  category.value.childIds?.sort((a, b) =>
    categoriesStore.items[a].name.localeCompare(categoriesStore.items[b].name),
  ) || [],
)

const onClickEdit = () => router.push(`/categories/${categoryId.value}/edit`)

useHead({
  title: category.value?.name,
})
</script>

<template>
  <UiPage v-if="category">
    <UiHeader>
      <router-link v-slot="{ href, navigate }" :to="backLink" custom>
        <a
          :href="href"
          class="grow hocus_bg-item-5"
          @click="navigate"
        >
          <CategoriesPageHeader
            :category="category"
            :parentCategory="categoriesStore.items[category.parentId]"
          />
        </a>
      </router-link>

      <template v-if="categoryId !== 'transfer'">
        <UiHeaderLink @click="onClickEdit">
          <div class="mdi mdi-pencil-outline text-xl group-hover_text-white" />
        </UiHeaderLink>
        <UiHeaderLink @click="$router.push('/categories/new')">
          <UiIconAdd class="h-6 w-6 group-hover_text-white" />
        </UiHeaderLink>
      </template>
    </UiHeader>

    <div
      v-if="category.childIds && category.childIds.length > 0"
      class="px-2 pt-4 mb-12"
    >
      <CategoriesList
        :ids="categoryChildIds"
        @click="id => $router.push(`/categories/${id}`)"
      />
    </div>

    <StatMini
      :categoryId
    />
  </UiPage>
</template>
