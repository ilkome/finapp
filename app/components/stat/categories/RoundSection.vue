<script setup lang="ts">
import type { CategoryId } from '~/components/categories/types'
import type { TrnId } from '~/components/trns/types'

import { useCategoriesStore } from '~/components/categories/useCategoriesStore'
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

const { t } = useI18n()
const visibleCategoriesLimit = 12

const { computeCategoriesWithData } = useStatCategories()
const categoriesStore = useCategoriesStore()
const statConfig = inject(statConfigKey)!
const isMenuOpen = ref(false)

const isExpanded = computed(() => statConfig.config.value.catsRound.isExpanded)
const isGrouped = computed(() => statConfig.config.value.catsRound.isGrouped)
const isShowFavorites = computed(() => statConfig.config.value.catsRound.isShowFavorites)
const isShowRecent = computed(() => statConfig.config.value.catsRound.isShowRecent)

const mergedPreCategoriesIds = computed(() => {
  const ids: CategoryId[] = []
  const seen = new Set<CategoryId>()

  function addId(id: CategoryId) {
    if (!seen.has(id)) {
      seen.add(id)
      ids.push(id)
    }
  }

  if (props.preCategoriesIds) {
    for (const id of props.preCategoriesIds)
      addId(id)
  }

  if (isShowFavorites.value) {
    for (const id of categoriesStore.favoriteCategoriesIds)
      addId(id)
  }

  if (isShowRecent.value) {
    for (const id of categoriesStore.recentCategoriesIds)
      addId(id)
  }

  for (const id of props.filteredCategoriesIds)
    addId(id)

  return ids
})

const roundCategories = computed(() => computeCategoriesWithData(props.selectedTrnsIds ?? [], isGrouped.value, mergedPreCategoriesIds.value))
const visibleCategories = computed(() => isExpanded.value ? roundCategories.value : roundCategories.value.slice(0, visibleCategoriesLimit))
const filteredSet = computed(() => new Set(props.filteredCategoriesIds))
</script>

<template>
  <div class="flex items-start gap-1">
    <div class="flex min-w-0 flex-1 flex-wrap justify-center gap-1 gap-y-2 @2xl/stat:justify-start">
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
        :isShowParent="false"
        @click="emit('setCategoryFilter', item.id)"
      />
    </div>

    <div class="sticky top-0 shrink-0">
      <UPopover
        v-model:open="isMenuOpen"
        :content="{
          align: 'end',
          side: 'bottom',
        }"
      >
        <UiActionButton
          :ariaLabel="t('base.moreOptions')"
          class="aspect-square"
          size="sm"
        >
          <Icon name="lucide:ellipsis" :size="20" />
        </UiActionButton>

        <template #content>
          <div class="min-w-52 p-1">
            <UiSwitchItem
              :checkboxValue="isGrouped"
              :title="t('stat.config.categories.rounds.groupByParent')"
              @click="statConfig.updateConfig('catsRound', { isGrouped: !isGrouped })"
            />
            <UiSwitchItem
              :checkboxValue="isShowFavorites"
              :title="t('stat.config.categories.rounds.showFavorites')"
              @click="statConfig.updateConfig('catsRound', { isShowFavorites: !isShowFavorites })"
            />
            <UiSwitchItem
              :checkboxValue="isShowRecent"
              :title="t('stat.config.categories.rounds.showRecent')"
              @click="statConfig.updateConfig('catsRound', { isShowRecent: !isShowRecent })"
            />

            <UiSwitchItem
              v-if="roundCategories.length > visibleCategoriesLimit"
              :checkboxValue="isExpanded"
              :title="t('base.toggleExpand')"
              @click="statConfig.updateConfig('catsRound', { isExpanded: !isExpanded })"
            />
          </div>
        </template>
      </UPopover>
    </div>
  </div>
</template>
