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
const snapPoints = useSheetSnapPoints()
</script>

<template>
  <StatDateNavigation :isShowButtons="isShowNavigation">
    <template v-if="props.isShowSearch" #tools>
      <FilterSearchToggle />
    </template>

    <BottomSheetOrDropdown
      class="flex shrink-0 snap-start snap-always gap-1"
      :isOpen="isFilterOpen"
      popoverBodyClass="py-0! md:pb-0!"
      :snapPoints="snapPoints"
      :unmountOnHide="false"
      keyboardTrigger
      @closeModal="isFilterOpen = false"
      @openModal="isFilterOpen = true"
    >
      <template #trigger="{ isActive }">
        <UiTitleDropdown :isActive>
          <span class="text-nowrap">{{ summaryText }}</span>
        </UiTitleDropdown>
      </template>

      <template #custom="{ close, isExpanded }">
        <FilterPanel :isExpanded="isExpanded" @close="close" />
      </template>
    </BottomSheetOrDropdown>
    <FilterSelected
      v-if="filter.isShow.value"
      class="snap-start snap-always *:snap-start *:snap-always"
      :isShowCategories="filter.canFilterCategories"
      :isShowWallets="filter.canFilterWallets"
    />
  </StatDateNavigation>
</template>
