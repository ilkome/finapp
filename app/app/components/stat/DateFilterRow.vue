<script setup lang="ts">
import { filterKey } from '~/components/filter/injectionKeys'
import { useFilterSummary } from '~/components/filter/useFilterSummary'

const props = withDefaults(defineProps<{
  isShowNavigation?: boolean
  isShowSearch?: boolean
}>(), {
  isShowNavigation: true,
})

const filter = inject(filterKey)!
const { summaryText } = useFilterSummary()
const isFilterOpen = ref(false)
</script>

<template>
  <StatDateNavigation :isShowButtons="isShowNavigation">
    <template v-if="props.isShowSearch" #tools>
      <FilterSearchToggle />
    </template>

    <DrawerOrDropdown
      v-model:open="isFilterOpen"
      class="flex shrink-0 snap-start snap-always gap-1"
      :collapsedSnap="500"
      :unmountOnHide="false"
      keyboardTrigger
    >
      <template #trigger="{ isActive }">
        <UiTitleDropdown :isActive>
          <span class="text-nowrap">{{ summaryText }}</span>
        </UiTitleDropdown>
      </template>

      <template #custom="{ close }">
        <FilterPanel @close="close" />
      </template>
    </DrawerOrDropdown>
    <FilterSelected
      v-if="filter.isShow.value"
      class="snap-start snap-always *:snap-start *:snap-always"
      :isShowCategories="filter.canFilterCategories"
      :isShowWallets="filter.canFilterWallets"
    />
  </StatDateNavigation>
</template>
