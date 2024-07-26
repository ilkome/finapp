<script setup lang="ts">
import { useCategoriesStore } from '~/components/categories/useCategories'
import type { CategoryId } from '~/components/categories/types'
import { useFilter } from '~/components/filter/useFilter'
import { useStat } from '~/components/stat/useStat'
import { getTrnsIds } from '~/components/trns/getTrns'
import { useTrnsStore } from '~/components/trns/useTrnsStore'

const filter = useFilter()
const stat = useStat(filter)

provide('stat', stat)
provide('filter', filter)

const route = useRoute()
const router = useRouter()
const categoriesStore = useCategoriesStore()
const trnsStore = useTrnsStore()

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
      <RouterLink v-slot="{ href, navigate }" :to="backLink" custom>
        <a
          :href="href"
          class="grow hocus:bg-item-5"
          @click="navigate"
        >
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
        <UiHeaderLink @click="$router.push('/categories/new')">
          <UiIconAdd class="h-6 w-6 group-hover:text-white" />
        </UiHeaderLink>
      </template>
    </UiHeader>

    <div class="grid gap-12 px-2">
      <StatMiniItem
        type="sum"
        :isQuickModal="!category.childIds || category.childIds.length === 0"
        :trnsIds="getTrnsIds({
          categoriesIds: categoriesStore.getChildsIdsOrParent(categoryId),
          trnsItems: trnsStore.items,
        })"
        :categoriesIds="[categoryId]"
        :storageKey="categoryId"
        isShowTotals
      />

      <div>
        <UiToggle
          v-if="category.childIds && category.childIds.length > 0"
          :storageKey="`finapp-category-page-${categoryId}`"
          :initStatus="false"
        >
          <template #header="{ toggle, isShown }">
            <UiTitle7 @click="toggle">
              <div>{{ $t('categories.childs') }}</div>
              <Icon
                v-if="!isShown"
                name="mdi:chevron-down"
                size="22"
                class="-ml-1"
              />
            </UiTitle7>
          </template>

          <CategoriesList
            :ids="categoryChildIds"
            @click="id => $router.push(`/categories/${id}`)"
          />
        </UiToggle>
      </div>
    </div>
  </UiPage>
</template>
