<script setup lang="ts">
import type { CategoryId } from '~/components/categories/types'
import { useCategoriesStore } from '~/components/categories/useCategoriesStore'
import { useFilter } from '~/components/filter/useFilter'
import { useTrnsStore } from '~/components/trns/useTrnsStore'
import { useStatConfig } from '~/components/stat/useStatConfig'
import { useIntervalRange } from '~/components/date/useIntervalRange'

const route = useRoute()
const categoriesStore = useCategoriesStore()
const trnsStore = useTrnsStore()
const filter = useFilter()
provide('filter', filter)

const categoryId = computed(() => route.params.id) as ComputedRef<CategoryId>
const categoryHasChildren = computed(() => categoriesStore.hasChildren(categoryId.value))
const childIds = computed(() => categoriesStore.getChildsIds(categoryId.value))
const categoriesIdsOrParent = computed(() => categoriesStore.getChildsIdsOrParent(categoryId.value))
const trnsIds = computed(() => trnsStore.getStoreTrnsIds({ categoriesIds: categoriesIdsOrParent.value }))
const maxRange = computed(() => trnsStore.getRange(trnsIds.value))

const intervalRange = useIntervalRange({
  key: `finapp-${categoryId.value}-`,
  maxRange,
  queryParams: route.query,
})

provide('intervalRange', intervalRange)

const { config, updateConfig } = useStatConfig({
  props: {
    isShowEmptyCategories: true,
  },
  storageKey: categoryId.value,
})

const category = computed(() => categoriesStore.items[categoryId.value])
const backLink = computed(() => `/dashboard`)

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

      <StatConfigPopover
        :config="config"
        @updateConfig="updateConfig"
      />
    </UiHeader>

    <StatItemForCategory
      :hasChildren="categoryHasChildren"
      :config="config"
      :storageKey="categoryId"
      :preCategoriesIds="config.isShowEmptyCategories ? childIds : []"
      :trnsIds="trnsIds"
      class="max-w-6xl pb-24 lg:gap-8 lg:px-4 xl:py-2"
      type="sum"
      @updateConfig="updateConfig"
    />
  </UiPage>
</template>
