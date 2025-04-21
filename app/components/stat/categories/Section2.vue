<script setup lang="ts">
import { useStorage } from '@vueuse/core'

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

const biggestCatNumber = computed(() => getBiggestCatNumber(categoriesWithData.value))

function getBiggestCatNumber(categories: CategoryWithData[]) {
  const income = categories.filter(c => c.value > 0).at(0)?.value ?? 0
  const expense = categories.filter(c => c.value < 0).at(0)?.value ?? 0

  return {
    expense: Math.abs(expense),
    income,
  }
}

type CategoryState = { show: boolean }
type CategoriesState = Record<CategoryId, CategoryState>

function createInitialState(storeCategories: Categories): CategoriesState {
  return Object.entries(storeCategories).reduce((acc, [id]) => {
    acc[id] = { show: false }
    return acc
  }, {} as CategoriesState)
}

const categoriesOpened = useStorage<CategoriesState>(
  `statCategoriesOpened1${props.storageKey}`,
  createInitialState(categoriesStore.items ?? {}),
)

function getCurrentState(categories: CategoryWithData[]): CategoriesState {
  return categories.reduce((acc, cat) => {
    acc[cat.id] = {
      show: categoriesOpened.value[cat.id]?.show ?? false,
    }
    return acc
  }, {} as CategoriesState)
}

const currentState = computed(() => getCurrentState(categoriesWithData.value))

const openedStatus = computed(() => {
  const cats = Object.values(currentState.value)
  return {
    isAllRootOpen: cats.every(cat => cat.show),
    isAnyRootOpen: cats.some(cat => cat.show),
  }
})

function toggleOpened() {
  const newShow = !openedStatus.value.isAnyRootOpen
  Object.keys(currentState.value).forEach((id) => {
    categoriesOpened.value[id] = { show: newShow }
  })
}

function toggleRoot(id: CategoryId) {
  categoriesOpened.value[id] = {
    show: !categoriesOpened.value[id]?.show,
  }
}
</script>

<template>
  <div
    v-if="categoriesWithData.length > 0"
    class="@3xl/main:max-w-lg grid gap-3 content-start"
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
            <UiItem1
              :isActive="statConfig.config.value.vertical.isGrouped"
              @click="statConfig.config.value.vertical.isGrouped = !statConfig.config.value.vertical.isGrouped"
            >
              <Icon
                :name="statConfig.config.value.vertical.isGrouped ? 'lucide:network' : 'lucide:folder-tree'"
                :size="20"
              />
            </UiItem1>
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
              v-if="statConfig.config.value.catsView === 'list' && !props.isOneCategory && statConfig.config.value.catsList.isGrouped"
              @click="toggleOpened"
            >
              <Icon
                v-if="openedStatus.isAllRootOpen"
                name="lucide:folder-open"
                size="20"
              />
              <Icon
                v-if="!openedStatus.isAllRootOpen && openedStatus.isAnyRootOpen"
                name="lucide:folder-open-dot"
                size="20"
              />
              <Icon
                v-if="!openedStatus.isAllRootOpen && !openedStatus.isAnyRootOpen"
                name="lucide:folder"
                size="20"
              />
            </UiItem1>

            <UiItem1
              v-if="!props.isOneCategory"
              :isActive="statConfig.config.value.catsList.isGrouped"
              @click="statConfig.config.value.catsList.isGrouped = !statConfig.config.value.catsList.isGrouped"
            >
              <Icon
                :name="statConfig.config.value.catsList.isGrouped ? 'lucide:network' : 'lucide:folder-tree'"
                :size="20"
              />
            </UiItem1>
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
          >
            <template #header>
              <div class="-mt-px flex items-stretch justify-between">
                <StatCategoriesLine
                  :isShowParent="props.isOneCategory ? false : !statConfig.config.value.catsList.isGrouped"
                  :item="item"
                  :biggestCatNumber="linesBiggestCatNumber"
                  :lineWidth="statConfig.config.value.catsList.isLines ? 0 : 1"
                  class="grow"
                  @click="(item.categories && item.categories?.length >= 1) ? toggleRoot(item.id) : emit('clickCategory', item.id)"
                />
              </div>
            </template>

            <!-- Inside -->
            <div
              v-if="categoriesOpened[item.id]?.show && item.categories && item.categories?.length >= 1"
              class="ml-5 mt-[-2px] -translate-x-px pl-3 pb-3"
            >
              <div
                :class="{
                  'mt-1': statConfig.config.value.catsList.isItemsBg,
                }"
                class="grid"
              >
                <StatCategoriesLine
                  v-for="itemInside in item.categories"
                  :key="itemInside.id"
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
            </div>
          </UiToggle3>
        </div>
      </template>
    </UiToggle>
  </div>
</template>
