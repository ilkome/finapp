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
const trnsIds = computed(() => trnsStore.getStoreTrnsIds({ categoriesIds: categoriesStore.getChildsIdsOrParent(categoryId.value) }))
const maxRange = computed(() => trnsStore.getRange(trnsIds.value))

const intervalRange = useIntervalRange({
  key: `finapp-${categoryId.value}-`,
  maxRange,
  queryParams: route.query,
})

provide('intervalRange', intervalRange)

const { config, updateConfig } = useStatConfig({ storageKey: categoryId.value })
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

    <!-- <div class="grid gap-2 px-2 pb-24 md:px-6">
      <h1>hello</h1>

      <h2>route.query</h2>
      <pre>{{ route.query }}</pre>

      <hr>
      <h2>intervalRange.params</h2>
      <pre>{{ intervalRange.params }}</pre>
    </div> -->

    <StatItem2
      :config="config"
      :storageKey="categoryId"
      :trnsIds="trnsIds"
      class="-max-w-2xl max-w-6xl pb-24 lg:gap-8 lg:px-4 xl:py-2"
      type="sum"
      @updateConfig="updateConfig"
    />
  </UiPage>
</template>
