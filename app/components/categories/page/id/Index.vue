<script setup lang="ts">
import { useCategoriesStore } from '~/components/categories/useCategories'
import type { CategoryId } from '~/components/categories/types'
import { useTrnsStore } from '~/components/trns/useTrnsStore'

const route = useRoute()
const router = useRouter()
const categoriesStore = useCategoriesStore()
const trnsStore = useTrnsStore()

const categoryId = computed(() => route.params.id) as ComputedRef<CategoryId>
const category = computed(() => categoriesStore.items[categoryId.value])

if (!category.value) router.replace('/categories')

const backLink = computed(() =>
  category.value?.parentId
    ? `/categories/${category.value.parentId}`
    : '/categories'
)

const onClickEdit = () => router.push(`/categories/${categoryId.value}/edit`)

const childsIds = computed(() => categoriesStore.getChildsIds(categoryId.value))
useHead({
  title: category.value?.name,
})
</script>

<template>
  <UiPage v-if="category">
    <UiHeader>
      <RouterLink v-slot="{ href, navigate }" :to="backLink" custom>
        <a :href="href" class="grow hocus:bg-item-5" @click="navigate">
          <CategoriesPageHeader
            :category="category"
            :parentCategory="categoriesStore.items[category.parentId]"
          />
        </a>
      </RouterLink>

      <template v-if="categoryId !== 'transfer'">
        <UiHeaderLink @click="onClickEdit">
          <div class="mdi mdi-pencil-outline text-xl group-hover:text-white" />
        </UiHeaderLink>
        <UiHeaderLink @click="router.push('/categories/new')">
          <UiIconAdd class="h-6 w-6 group-hover:text-white" />
        </UiHeaderLink>
      </template>
    </UiHeader>

    <div class="-px-2 -pt-2 xl:-px-16 grid gap-2 pb-24 lg:px-4">
      <StatMiniItem
        type="sum"
        :isQuickModal="!categoriesStore.hasChildren(categoryId)"
        :trnsIds="
          trnsStore.getStoreTrnsIds({
            categoriesIds: categoriesStore.getChildsIdsOrParent(categoryId),
          })
        "
        :preCategoriesIds="childsIds"
        :storageKey="categoryId"
        isShowTotals
      />
    </div>
  </UiPage>
</template>
