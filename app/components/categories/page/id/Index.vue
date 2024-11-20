<script setup lang="ts">
import type { CategoryId } from '~/components/categories/types'
import { calculateBestIntervalsBy } from '~/components/date/utils'
import { useCategoriesStore } from '~/components/categories/useCategoriesStore'
import { useFilter } from '~/components/filter/useFilter'
import { useStatConfig } from '~/components/stat/useStatConfig'
import { useStatDate } from '~/components/date/useStatDate'
import { useTrnsStore } from '~/components/trns/useTrnsStore'

const categoriesStore = useCategoriesStore()
const filter = useFilter()
const route = useRoute()
const router = useRouter()
const trnsStore = useTrnsStore()
provide('filter', filter)

const categoryId = computed(() => route.params.id) as ComputedRef<CategoryId>
const category = ref(categoriesStore.items[categoryId.value])
const categoryHasChildren = computed(() => categoriesStore.hasChildren(categoryId.value))
const childIds = computed(() => categoriesStore.getChildsIds(categoryId.value))
const categoriesIdsOrParent = computed(() => categoriesStore.getChildsIdsOrParent(categoryId.value))
const trnsIds = computed(() => trnsStore.getStoreTrnsIds({
  categoriesIds: categoriesIdsOrParent.value,
  walletsIds: filter?.walletsIds?.value ?? [],
}))
const maxRange = computed(() => trnsStore.getRange(trnsIds.value))

const statDate = useStatDate({
  initParams: {
    intervalsBy: calculateBestIntervalsBy(maxRange.value),
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

    <div
      v-if="trnsIds.length > 0 || filter.isShow?.value"
      class="px-2 pt-2 md:px-6"
    >
      <FilterSelector
        isShowWallets
        class="pb-2"
      />
      <FilterSelected
        v-if="filter.isShow?.value"
        isShowCategories
        isShowWallets
      />
    </div>

    <div v-if="trnsIds.length > 0">
      <div class="px-2 pt-2 md:px-6">
        <StatItemForCategory
          :hasChildren="categoryHasChildren"
          :storageKey="categoryId"
          :preCategoriesIds="statConfig.config.value.isShowEmptyCategories ? childIds : []"
          :trnsIds="trnsIds"
          class="max-w-6xl pb-24 lg:gap-8 lg:px-4 xl:py-2"
          type="sum"
        />
      </div>
    </div>

    <div v-else class="pageWrapper">
      <TrnsNoTrns />
    </div>
  </UiPage>
</template>
