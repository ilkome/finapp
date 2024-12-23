<script setup lang="ts">
import type { CategoryId } from '~/components/categories/types'
import type { CategoryWithData, MoneyTypeSlugNew } from '~/components/stat/types'
import type { StatConfigProvider } from '~/components/stat/useStatConfig'
import type { TrnId } from '~/components/trns/types'

import { useStatCategories } from '~/components/stat/useStatCategories'

const props = defineProps<{
  preCategoriesIds?: CategoryId[]
  selectedTrnsIds?: TrnId[]
  storageKey: string
  type: MoneyTypeSlugNew
}>()

defineEmits<{
  clickCategory: [categoryId: CategoryId]
}>()

const { getCategoriesWithData } = useStatCategories()
const statConfig = inject('statConfig') as StatConfigProvider

const categoriesWithData = computed<CategoryWithData[]>(() => {
  const isGrouped = statConfig.config.value[statConfig.config.value.catsView === 'list' ? 'catsList' : 'catsRound'].isGrouped

  const cats: CategoryId[] = []
  if (statConfig.config.value?.isShowEmptyCategories && props.preCategoriesIds) {
    cats.push(...props.preCategoriesIds)
  }

  return getCategoriesWithData(props.selectedTrnsIds ?? [], isGrouped, cats)
})

const verticalCategories = computed<CategoryWithData[]>(() => getCategoriesWithData(props.selectedTrnsIds ?? [], statConfig.config.value.vertical.isGrouped))
const verticalBiggestCatNumber = computed(() => getBiggestCatNumber(verticalCategories.value))
const biggestCatNumber = computed(() => getBiggestCatNumber(categoriesWithData.value))

function getBiggestCatNumber(categories: CategoryWithData[]) {
  const income = categories.filter(c => c.value > 0).at(0)?.value ?? 0
  const expense = categories.filter(c => c.value < 0).at(0)?.value ?? 0

  return {
    expense: Math.abs(expense),
    income,
  }
}
</script>

<template>
  <UiToggle
    :storageKey="`${storageKey}-${type}-cats`"
    :initStatus="true"
    openPadding="pb-3"
    class="min-w-80 md:max-w-lg"
  >
    <template #header="{ toggle, isShown }">
      <div class="flex items-center justify-between md:max-w-lg">
        <UiTitle8 :isShown @click="toggle">
          {{ $t('categories.title') }} {{ (!isShown && categoriesWithData.length > 0) ? categoriesWithData.length : '' }}
        </UiTitle8>

        <StatCategoriesButtons
          v-if="isShown"
          :catsLength="categoriesWithData.length"
        />
      </div>
    </template>

    <template v-if="categoriesWithData.length > 0">
      <div
        v-if="statConfig.config.value.vertical.isShow && verticalCategories.length > 1"
        class="flex overflow-y-auto pb-2 pl-1 pt-4"
      >
        <StatCategoriesVertical
          v-for="item in verticalCategories.filter(c => c.value !== 0)"
          :key="item.id"
          :item="item"
          :biggestCatNumber="verticalBiggestCatNumber"
          @click="$emit('clickCategory', item.id)"
        />
      </div>

      <!-- Lines -->
      <div
        v-if="statConfig.config.value.catsView === 'list'"
        :class="{
          'md:max-w-lg': !statConfig.config.value.catsList.isGrouped || !statConfig.config.value.catsList.isOpened,
          'grid gap-1': statConfig.config.value.catsList.isItemsBg,
        }"
        class="pt-2"
      >
        <UiToggle
          v-for="item in categoriesWithData"
          :key="item.id"
          :class="{
            group: !statConfig.config.value.catsList.isItemsBg,
          }"
          :storageKey="`finapp-stat-cats-${statConfig.config.value.catsList.isGrouped ? 'grouped' : 'not-grouped'}-${item.id}-${statConfig.config.value.catsView}-${type}`"
          :initStatus="false"
          :openPadding="statConfig.config.value.catsList.isGrouped ? '!pb-3' : ''"
        >
          <template #header="{ toggle, isShown }">
            <div class="flex items-stretch justify-between">
              <UiToggleAction
                v-if="item.trnsIds.length > 0"
                :isShown="isShown"
                :class="{
                  '-mr-2.5': !statConfig.config.value.catsList.isItemsBg,
                }"
                @click="toggle"
              />
              <div
                v-else
                class="w-8"
              />

              <StatCategoriesLine
                :isShowParent="!statConfig.config.value.catsList.isGrouped"
                :item="item"
                :biggestCatNumber="biggestCatNumber"
                :lineWidth="statConfig.config.value.catsList.isLines ? 0 : 1"
                class="grow"
                @click="$emit('clickCategory', item.id)"
              />
            </div>
          </template>

          <!-- Inside -->
          <div class="border-item-5 ml-5 mt-1 -translate-x-px border-l pl-3">
            <div
              v-if="!item.categories || item.categories.length === 0"
              class="mb-3 ml-2"
            >
              <TrnsList
                :trnsIds="item.trnsIds"
                :size="5"
                alt
                isShowExpense
                isShowIncome
                isShowTransfers
              />
            </div>

            <div
              v-if="item.categories && statConfig.config.value.catsList.isGrouped && statConfig.config.value.catsList.isOpened"
              class="flex flex-wrap gap-1 pl-3"
            >
              <StatCategoriesRound
                v-for="itemInside in item.categories"
                :key="itemInside.id"
                :item="itemInside"
                isShowAmount
                @click="$emit('clickCategory', itemInside.id)"
              />
            </div>

            <div
              v-if="!statConfig.config.value.catsList.isOpened"
              class="grid gap-1"
            >
              <UiToggle
                v-for="itemInside in item.categories"
                :key="itemInside.id"
                :class="{
                  group: !statConfig.config.value.catsList.isItemsBg,
                }"
                :storageKey="`finapp-stat-cats-${itemInside.id}-${type}`"
                :initStatus="false"
                :lineWidth="1"
                :openPadding="statConfig.config.value.catsList.isGrouped ? '!pb-3' : ''"
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
                      @click="$emit('clickCategory', itemInside.id)"
                    />
                  </div>
                </template>

                <!-- Inside -->
                <div class="border-item-5 ml-5 mt-[-2px] -translate-x-px border-l pl-5">
                  <TrnsList
                    :trnsIds="itemInside.trnsIds"
                    :size="5"
                    alt
                    isShowExpense
                    isShowIncome
                    isShowTransfers
                  />
                </div>
              </UiToggle>
            </div>
          </div>
        </UiToggle>
      </div>

      <!-- Rounds -->
      <div
        v-if="statConfig.config.value.catsView === 'round'"
        class="@3xl/stat:gap-2 flex flex-wrap gap-1 gap-y-2 pl-1 pt-2 md:max-w-lg"
      >
        <StatCategoriesRound
          v-for="item in categoriesWithData"
          :key="item.id"
          :item="item"
          isShowAmount
          @click="$emit('clickCategory', item.id)"
        />
      </div>
    </template>
  </UiToggle>
</template>
