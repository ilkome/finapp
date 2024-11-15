<script setup lang="ts">
import type { CategoryId } from '~/components/categories/types'
import { useCategoriesStore } from '~/components/categories/useCategoriesStore'
import { useFilter } from '~/components/filter/useFilter'
import { useTrnsStore } from '~/components/trns/useTrnsStore'
import { useStatConfig } from '~/components/stat/useStatConfig'
import { useStatDate } from '~/components/date/useStatDate'

const route = useRoute()
const router = useRouter()
const categoriesStore = useCategoriesStore()
const trnsStore = useTrnsStore()
const filter = useFilter()
provide('filter', filter)

const categoryId = computed(() => route.params.id) as ComputedRef<CategoryId>
const category = ref(categoriesStore.items[categoryId.value])
const categoryHasChildren = computed(() => categoriesStore.hasChildren(categoryId.value))
const childIds = computed(() => categoriesStore.getChildsIds(categoryId.value))
const categoriesIdsOrParent = computed(() => categoriesStore.getChildsIdsOrParent(categoryId.value))
const trnsIds = computed(() => trnsStore.getStoreTrnsIds({ categoriesIds: categoriesIdsOrParent.value }))
const maxRange = computed(() => trnsStore.getRange(trnsIds.value))

const statDate = useStatDate({
  initParams: {
    isShowMaxRange: true,
    isSkipEmpty: true,
  },
  key: `finapp-${categoryId.value}-`,
  maxRange,
  queryParams: route.query,
})

provide('statDate', statDate)

const statConfig = useStatConfig({
  props: {
    isShowEmptyCategories: true,
  },
  storageKey: categoryId.value,
})
provide('statConfig', statConfig)

if (!category.value)
  router.replace('/categories')

const backLink = computed(() =>
  category.value?.parentId
    ? `/categories/${category.value.parentId}`
    : '/categories',
)

useHead({ title: category.value?.name })
</script>

<template>
  <UiPage v-if="category">
    <UiHeader class="bg-foreground-3">
      <RouterLink
        v-slot="{ href, navigate }"
        :to="backLink"
        custom
      >
        <a
          :href="href"
          class="hocus:bg-item-5 -mx-2 grow cursor-default overflow-hidden rounded-lg px-2"
          @click="navigate"
        >
          <CategoriesHeader
            :category="category"
            :parentCategory="categoriesStore.items[category.parentId]"
          />
        </a>
      </RouterLink>

      <template v-if="!categoriesStore.transferCategoriesIds.includes(categoryId)">
        <UiHeaderLink @click="router.push(`/categories/${categoryId}/edit`)">
          <div class="mdi mdi-pencil-outline text-xl group-hover:text-white" />
        </UiHeaderLink>
      </template>

      <StatConfigPopover />
    </UiHeader>

    <StatItemForCategory
      :hasChildren="categoryHasChildren"
      :storageKey="categoryId"
      :preCategoriesIds="statConfig.config.value.isShowEmptyCategories ? childIds : []"
      :trnsIds="trnsIds"
      class="max-w-6xl pb-24 lg:gap-8 lg:px-4 xl:py-2"
      type="sum"
    />
  </UiPage>
</template>
