<script setup lang="ts">
import type { CategoryId } from '~/components/categories/types'
import { useCategoriesStore } from '~/components/categories/useCategoriesStore'
import { useFilter } from '~/components/filter/useFilter'
import { useTrnsStore } from '~/components/trns/useTrnsStore'

const route = useRoute()
const router = useRouter()
const categoriesStore = useCategoriesStore()
const trnsStore = useTrnsStore()
const filter = useFilter()
provide('filter', filter)

const categoryId = computed(() => route.params.id) as ComputedRef<CategoryId>
const category = computed(() => categoriesStore.items[categoryId.value])

if (!category.value)
  router.replace('/categories')

const backLink = computed(() =>
  category.value?.parentId
    ? `/categories/${category.value.parentId}`
    : '/categories',
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
        <a
          :href="href"
          class="hocus:bg-item-5 -mx-2 grow px-2"
          @click="navigate"
        >
          <CategoriesHeader
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
          <UiIconAdd class="size-6 group-hover:text-white" />
        </UiHeaderLink>
      </template>
    </UiHeader>

    <div class="grid gap-2 px-2 pb-24 md:px-6">
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
