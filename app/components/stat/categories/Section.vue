<script setup lang="ts">
import type { CategoryId } from '~/components/categories/types'
import type { StatConfigProvider } from '~/components/stat/useStatConfig'
import type { TrnId } from '~/components/trns/types'

import { useStatCategories } from '~/components/stat/categories/useStatCategories'

const props = defineProps<{
  filteredCategoriesIds: CategoryId[]
  isOneCategory?: boolean
  preCategoriesIds?: CategoryId[]
  selectedTrnsIds?: TrnId[]
}>()

const emit = defineEmits<{
  clickCategory: [categoryId: CategoryId]
  onSetCategoryFilter: [categoryId: CategoryId]
}>()

const visibleCategoriesLimit = 12

const { getCategoriesWithData } = useStatCategories()
const statConfig = inject('statConfig') as StatConfigProvider
const isExpanded = ref(false)

const roundCategories = computed(() => getCategoriesWithData(props.selectedTrnsIds ?? [], statConfig.config.value.catsRound.isGrouped, props.preCategoriesIds))
const visibleCategories = computed(() => isExpanded.value ? roundCategories.value : roundCategories.value.slice(0, visibleCategoriesLimit))
</script>

<template>
  <div class="flex flex-wrap gap-1 gap-y-2">
    <StatCategoriesRound2lines
      v-for="item in visibleCategories"
      :key="item.id"
      :item="item"
      :class="{
        'opacity-60': props.filteredCategoriesIds?.length > 0 && !props.filteredCategoriesIds?.includes(item.id),
        'opacity-50': !props.filteredCategoriesIds?.includes(item.id) && item.value === 0,
      }"
      class="transition-opacity"
      isShowAmount
      @click="emit('onSetCategoryFilter', item.id)"
    />

    <div
      v-if="!props.isOneCategory"
      class="flex items-center"
    >
      <UiTabs1>
        <UiItem4
          v-if="roundCategories.length > visibleCategoriesLimit"
          @click="isExpanded = !isExpanded"
        >
          <Icon
            :name="isExpanded ? 'lucide:chevron-up' : 'lucide:chevron-down'"
            :size="20"
          />
        </UiItem4>

        <UiItem4
          @click="statConfig.config.value.catsRound.isGrouped = !statConfig.config.value.catsRound.isGrouped"
        >
          <Icon
            :name="statConfig.config.value.catsRound.isGrouped ? 'lucide:network' : 'lucide:folder-tree'"
            :size="20"
          />
        </UiItem4>
      </UiTabs1>
    </div>
  </div>
</template>
