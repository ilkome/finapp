<script setup lang="ts">
import { useStorage } from '@vueuse/core'
import defu from 'defu'

import type { Categories, CategoryId } from '~/components/categories/types'
import type { CategoryWithData, StatTabSlug } from '~/components/stat/types'
import type { StatConfigProvider } from '~/components/stat/useStatConfig'
import type { TrnId } from '~/components/trns/types'

import { useCategoriesStore } from '~/components/categories/useCategoriesStore'
import { useStatCategories } from '~/components/stat/categories/useStatCategories'

const props = defineProps<{
  isOneCategory?: boolean
  preCategoriesIds?: CategoryId[]
  selectedAndFilteredTrnsIds?: TrnId[]
  selectedTrnsIds?: TrnId[]
  storageKey: string
  type: StatTabSlug
}>()

const emit = defineEmits<{
  clickCategory: [categoryId: CategoryId]
  onSetCategoryFilter: [categoryId: CategoryId]
}>()

const { t } = useI18n()
const { getCategoriesWithData } = useStatCategories()
const categoriesStore = useCategoriesStore()
const statConfig = inject('statConfig') as StatConfigProvider

const categoriesWithData = computed<CategoryWithData[]>(() => {
  const isGrouped = statConfig.config.value[statConfig.config.value.catsView === 'list' ? 'catsList' : 'catsRound'].isGrouped

  const cats: CategoryId[] = []
  if (statConfig.config.value?.isShowEmptyCategories && props.preCategoriesIds) {
    cats.push(...props.preCategoriesIds)
  }

  return getCategoriesWithData(props.selectedTrnsIds ?? [], isGrouped, cats)
})

const categoriesStat = computed<{ grouped: CategoryWithData[], ungrouped: CategoryWithData[] }>(() => ({
  grouped: getCategoriesWithData(props.selectedTrnsIds ?? [], true),
  ungrouped: getCategoriesWithData(props.selectedTrnsIds ?? [], false),
}))

const verticalCategories = computed<CategoryWithData[]>(() => categoriesStat.value[statConfig.config.value.vertical.isGrouped ? 'grouped' : 'ungrouped'])
const verticalBiggestCatNumber = computed(() => getBiggestCatNumber(verticalCategories.value))

const linesCategories = computed<CategoryWithData[]>(() => categoriesStat.value[statConfig.config.value.catsList.isGrouped ? 'grouped' : 'ungrouped'])
const linesBiggestCatNumber = computed(() => getBiggestCatNumber(linesCategories.value))

const roundCategories = computed<CategoryWithData[]>(() => categoriesStat.value[statConfig.config.value.catsRound.isGrouped ? 'grouped' : 'ungrouped'])
const biggestCatNumber = computed(() => getBiggestCatNumber(categoriesWithData.value))

function getBiggestCatNumber(categories: CategoryWithData[]) {
  const income = categories.filter(c => c.value > 0).at(0)?.value ?? 0
  const expense = categories.filter(c => c.value < 0).at(0)?.value ?? 0

  return {
    expense: Math.abs(expense),
    income,
  }
}

type CategoryStateInside = Record<CategoryId, { show: boolean }>
type CategoryState = { categories?: CategoryStateInside, show: boolean }
type CategoriesState = Record<CategoryId, CategoryState>

function createInitialChildState(childIds?: CategoryId[]): CategoryStateInside {
  return (childIds ?? []).reduce((acc, childId) => {
    acc[childId] = { show: false }
    return acc
  }, {} as CategoryStateInside)
}

function createInitialState(storeCategories: Categories): CategoriesState {
  return Object.entries(storeCategories).reduce((acc, [id, cat]) => {
    acc[id] = {
      categories: createInitialChildState(cat.childIds),
      show: false,
    }
    return acc
  }, {} as CategoriesState)
}

const categoriesOpened = useStorage<CategoriesState>(
  `statCategoriesOpened1${props.storageKey}`,
  createInitialState(categoriesStore.items ?? {}),
)

function getChildState(cat: CategoryWithData): CategoryStateInside {
  return Object.values(cat.categories ?? {}).reduce((acc, child) => {
    acc[child.id] = { show: categoriesOpened.value[cat.id]?.categories?.[child.id]?.show ?? false }
    return acc
  }, {} as CategoryStateInside)
}

function getCurrentState(categories: CategoryWithData[]): CategoriesState {
  return categories.reduce((acc, cat) => {
    acc[cat.id] = {
      categories: getChildState(cat),
      show: categoriesOpened.value[cat.id]?.show ?? false,
    }
    return acc
  }, {} as CategoriesState)
}

const currentState = computed(() => getCurrentState(categoriesWithData.value))

const openedStatus = computed(() => {
  const cats = Object.values(currentState.value)
  return {
    isAllChildOpen: cats.every(cat => Object.values(cat.categories ?? {}).every(c => c.show)),
    isAllRootOpen: cats.every(cat => cat.show),
    isAnyChildOpen: cats.some(cat => Object.values(cat.categories ?? {}).some(c => c.show)),
    isAnyRootOpen: cats.some(cat => cat.show),
  }
})

function toggleOpened() {
  if (openedStatus.value.isAllRootOpen && !openedStatus.value.isAllChildOpen) {
    updateState(currentState.value, { childShow: true })
    return
  }
  if (openedStatus.value.isAnyRootOpen) {
    updateState(currentState.value, { childShow: false, parentShow: false })
    return
  }
  updateState(currentState.value, { parentShow: true })
}

function toggleRoot(id: CategoryId) {
  const root = currentState.value[id]
  const allOpen = Object.values(root?.categories ?? {}).some(c => c.show)
  if (root?.show && allOpen) {
    categoriesOpened.value[id].categories = Object.keys(currentState.value[id]?.categories ?? {}).reduce((childAcc, childId) => {
      childAcc[childId] = { show: false }
      return childAcc
    }, {} as CategoryStateInside)
    return
  }
  categoriesOpened.value[id].show = !categoriesOpened.value[id]?.show
}

function toggleChild(id: CategoryId, childId: CategoryId) {
  categoriesOpened.value[id].categories[childId].show = !categoriesOpened.value[id]?.categories?.[childId]?.show
}

function updateState(state: CategoriesState, options: { childShow?: boolean, parentShow?: boolean }) {
  const { childShow, parentShow } = options
  const newState = Object.entries(state).reduce((acc, [id, cat]) => {
    acc[id] = { ...cat }
    if (parentShow !== undefined) {
      acc[id].show = parentShow
    }
    if (childShow !== undefined) {
      acc[id].categories = Object.fromEntries(
        Object.keys(cat.categories ?? {}).map(childId => [childId, { show: childShow }]),
      )
    }
    return acc
  }, {} as CategoriesState)
  categoriesOpened.value = defu(newState, categoriesOpened.value)
}
</script>

<template>
  <div
    v-if="categoriesWithData.length > 0"
    class="@3xl/main:max-w-lg"
  >
    <!-- Vertical -->
    <UiToggle
      v-if="statConfig.config.value.vertical.isShow"
      :storageKey="`${storageKey}-${type}-vertical`"
      :initStatus="true"
    >
      <template #header="{ toggle, isShown }">
        <div class="flex items-center justify-between">
          <UiTitle8 :isShown @click="toggle">
            {{ t('stat.config.categories.vertical.title') }} {{ (!isShown && verticalCategories.filter(c => c.value !== 0).length > 0) ? verticalCategories.filter(c => c.value !== 0).length : '' }}
          </UiTitle8>

          <div
            v-if="isShown && !props.isOneCategory"
            class="flex items-center"
          >
            <UiTabs1>
              <UiItem1
                :isActive="statConfig.config.value.vertical.isGrouped"
                @click="statConfig.config.value.vertical.isGrouped = true"
              >
                <Icon
                  name="lucide:network"
                  :size="16"
                />
              </UiItem1>

              <UiItem1
                :isActive="!statConfig.config.value.vertical.isGrouped"
                @click="statConfig.config.value.vertical.isGrouped = false"
              >
                <Icon
                  name="lucide:folder-tree"
                  :size="16"
                />
              </UiItem1>
            </UiTabs1>
          </div>
        </div>

        <div
          v-if="isShown"
          class="grid pt-3"
        >
          <div class="flex overflow-hidden overflow-x-auto pl-1 pt-2">
            <StatCategoriesVertical
              v-for="item in verticalCategories.filter(c => c.value !== 0)"
              :key="item.id"
              :item="item"
              :biggestCatNumber="verticalBiggestCatNumber"
              @click="emit('clickCategory', item.id)"
            />
          </div>
        </div>
      </template>
    </UiToggle>

    <!-- List -->
    <UiToggle
      v-if="statConfig.config.value.catsList.isShow"
      :storageKey="`${storageKey}-${type}-list`"
      :initStatus="true"
      class="@3xl/main:max-w-md"
    >
      <template #header="{ toggle, isShown }">
        <div class="flex items-center justify-between">
          <UiTitle8 :isShown @click="toggle">
            {{ t('stat.config.categories.list.title') }} {{ (!isShown && categoriesWithData.length > 0) ? categoriesWithData.length : '' }}
          </UiTitle8>

          <div
            v-if="isShown"
            class="flex items-center gap-1"
          >
            <UiItem1
              v-if="statConfig.config.value.catsView === 'list'"
              @click="toggleOpened"
            >
              <Icon
                v-if="openedStatus.isAnyRootOpen && !openedStatus.isAllChildOpen"
                name="lucide:folder-open"
              />
              <Icon
                v-if="openedStatus.isAnyRootOpen && openedStatus.isAllChildOpen"
                name="lucide:folder-kanban"
              />
              <Icon
                v-if="!openedStatus.isAnyRootOpen && !openedStatus.isAllRootOpen"
                name="lucide:folder"
              />
            </UiItem1>

            <UiTabs1 v-if="!props.isOneCategory">
              <UiItem1
                :isActive="statConfig.config.value.catsList.isGrouped"
                @click="statConfig.config.value.catsList.isGrouped = true"
              >
                <Icon
                  name="lucide:network"
                  :size="16"
                />
              </UiItem1>

              <UiItem1
                :isActive="!statConfig.config.value.catsList.isGrouped"
                @click="statConfig.config.value.catsList.isGrouped = false"
              >
                <Icon
                  name="lucide:folder-tree"
                  :size="16"
                />
              </UiItem1>
            </UiTabs1>
          </div>
        </div>

        <div
          v-if="isShown"
          :class="{
            '@3xl/main:max-w-md': !statConfig.config.value.catsList.isGrouped,
            'grid gap-1': statConfig.config.value.catsList.isItemsBg,
          }"
          class="pt-2"
        >
          <UiToggle3
            v-for="item in linesCategories"
            :key="item.id"
            :class="{
              group: !statConfig.config.value.catsList.isItemsBg,
            }"
            :isShown="categoriesOpened[item.id]?.show ?? false"
            :openPadding="statConfig.config.value.catsList.isGrouped ? '!pb-3' : ''"
            @click="toggleRoot(item.id)"
          >
            <template #header="{ toggle: toggle2, isShown: isShownRoot }">
              <div class="-mt-px flex items-stretch justify-between">
                <UiToggleAction
                  v-if="item.trnsIds.length > 0"
                  :isShown="isShownRoot"
                  :class="{
                    '-mr-2.5': !statConfig.config.value.catsList.isItemsBg,
                  }"
                  @click="toggle2"
                />
                <div
                  v-else
                  :class="{
                    'mr-2 pr-[3px]': statConfig.config.value.catsList.isItemsBg,
                  }"
                  class="w-8"
                />

                <StatCategoriesLine
                  :isShowParent="props.isOneCategory ? false : !statConfig.config.value.catsList.isGrouped"
                  :item="item"
                  :biggestCatNumber="linesBiggestCatNumber"
                  :lineWidth="statConfig.config.value.catsList.isLines ? 0 : 1"
                  class="grow"
                  @click="emit('clickCategory', item.id)"
                />
              </div>
            </template>

            <!-- Inside -->
            <div class="ml-5 mt-[-2px] -translate-x-px pl-3">
              <div
                v-if="!item.categories || item.categories.length === 0"
                class="mb-3 ml-11"
              >
                <TrnsList
                  :trnsIds="item.trnsIds"
                  :size="10"
                  alt
                  isShowExpense
                  isShowIncome
                  isShowTransfers
                />
              </div>

              <div
                v-if="item.categories && statConfig.config.value.catsList.isGrouped"
                class="flex flex-wrap gap-1 pl-12 pt-2"
              >
                <StatCategoriesRound
                  v-for="itemInside in item.categories"
                  :key="itemInside.id"
                  :item="itemInside"
                  isShowAmount
                  @click="emit('clickCategory', itemInside.id)"
                />
              </div>

              <div
                :class="{
                  'mt-1': statConfig.config.value.catsList.isItemsBg,
                }"
                class="_gap-1 grid"
              >
                <UiToggle3
                  v-for="itemInside in item.categories"
                  :key="itemInside.id"
                  :class="{
                    group: !statConfig.config.value.catsList.isItemsBg,
                  }"
                  :isShown="categoriesOpened[item.id]?.categories[itemInside.id]?.show ?? false"
                  :openPadding="statConfig.config.value.catsList.isGrouped ? '!pb-3' : ''"
                  @click="toggleChild(item.id, itemInside.id)"
                >
                  <template #header="{ toggle: toggleInside, isShown: isShownInside }">
                    <div class="flex items-stretch justify-between">
                      <UiToggleAction
                        v-if="statConfig.config.value.catsList.isGrouped"
                        :isShown="isShownInside"
                        :class="{
                          '-mr-2.5': !statConfig.config.value.catsList.isItemsBg,
                        }"
                        @click="toggleInside"
                      />

                      <StatCategoriesLine
                        :isShowParent="!statConfig.config.value.catsList.isGrouped"
                        :item="itemInside"
                        :biggestCatNumber="biggestCatNumber"
                        :lineWidth="statConfig.config.value.catsList.isLines ? 0 : 1"
                        class="grow"
                        :class="{
                          'my-px': statConfig.config.value.catsList.isItemsBg,
                        }"
                        @click="emit('clickCategory', itemInside.id)"
                      />
                    </div>
                  </template>

                  <!-- Inside -->
                  <div class="ml-5 mt-[-2px] -translate-x-px pl-14">
                    <TrnsList
                      :trnsIds="itemInside.trnsIds"
                      :size="5"
                      alt
                      isShowExpense
                      isShowIncome
                      isShowTransfers
                    />
                  </div>
                </UiToggle3>
              </div>
            </div>
          </UiToggle3>
        </div>
      </template>
    </UiToggle>
  </div>
</template>
