<script setup lang="ts">
import type { CategoryId } from '~/components/categories/types'
import type { TrnId } from '~/components/trns/types'

import { useStatCategories } from '~/components/stat/categories/useStatCategories'
import { statConfigKey } from '~/components/stat/injectionKeys'

const props = defineProps<{
  filteredCategoriesIds: CategoryId[]
  isOneCategory?: boolean
  preCategoriesIds?: CategoryId[]
  selectedTrnsIds?: TrnId[]
}>()

const emit = defineEmits<{
  clickCategory: [categoryId: CategoryId]
  setCategoryFilter: [categoryId: CategoryId]
}>()

const visibleCategoriesLimit = 12

const { computeCategoriesWithData } = useStatCategories()
const statConfig = inject(statConfigKey)!
const isExpanded = ref(false)

const isGrouped = computed(() => statConfig.config.value.catsRound.isGrouped)
const roundCategories = computed(() => computeCategoriesWithData(props.selectedTrnsIds ?? [], isGrouped.value, props.preCategoriesIds))
const visibleCategories = computed(() => isExpanded.value ? roundCategories.value : roundCategories.value.slice(0, visibleCategoriesLimit))
const filteredSet = computed(() => new Set(props.filteredCategoriesIds))
</script>

<template>
  <div class="flex flex-wrap gap-1 gap-y-2">
    <StatCategoriesRound2lines
      v-for="item in visibleCategories"
      :key="item.id"
      :item="item"
      :class="{
        'opacity-60': filteredSet.size > 0 && !filteredSet.has(item.id),
        'opacity-50': !filteredSet.has(item.id) && item.value === 0,
        '!border-(--ui-primary)': filteredSet.has(item.id),
      }"
      class="transition-opacity"
      isShowAmount
      @click="emit('setCategoryFilter', item.id)"
    />

    <div
      v-if="!props.isOneCategory"
      class="flex items-center"
    >
      <UiTabsBar>
        <UiActionButton
          v-if="roundCategories.length > visibleCategoriesLimit"
          :ariaLabel="$t('base.toggleExpand')"
          size="sm"
          @click="isExpanded = !isExpanded"
        >
          <Icon
            :name="isExpanded ? 'lucide:chevron-up' : 'lucide:chevron-down'"
            :size="20"
          />
        </UiActionButton>

        <StatCategoriesGroupingToggle
          :isGrouped="isGrouped"
          size="sm"
          @toggle="statConfig.config.value.catsRound.isGrouped = !isGrouped"
        />
      </UiTabsBar>
    </div>
  </div>
</template>
