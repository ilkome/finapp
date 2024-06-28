<script setup lang="ts">
import { useCurrenciesStore } from '~/components/currencies/useCurrencies'
import { useCategoriesStore } from '~/components/categories/useCategories'
import type { CategoryId } from '~/components/categories/types'
import type { TotalCategory } from '~/components/stat/useNewStat'

const props = defineProps<{
  biggestCatNumber: number
  isActive?: boolean
  isShowLinesChart?: boolean
  item: TotalCategory
}>()

const emit = defineEmits<{
  click: [categoryId: CategoryId]
}>()
const categoriesStore = useCategoriesStore()
const currenciesStore = useCurrenciesStore()

function getBarStyle(amount: number, categoryId: CategoryId) {
  return {
    backgroundColor: categoriesStore.items[categoryId].color,
    width: `${(Math.abs(amount) / Math.abs(props.biggestCatNumber ?? 0)) * 100}%`,
  }
}
</script>

<template>
  <div
    :class="{
      'bg-item-4 rounded-md mb-2': props.isActive,
    }"
    class="group"
  >
    <UiElement
      :isShowLine="!props.isShowLinesChart"
      :isActive="props.isActive"
      class="relative"
      isShowToggle
      @click="emit('click', props.item.id)"
    >
      <template #line>
        <div
          v-if="props.isShowLinesChart"
          class="absolute left-0 bottom-2 w-full pl-[68px] pr-3 rounded-lg overflow-hidden"
        >
          <div class="bg-item-3 rounded-lg overflow-hidden">
            <div
              class="h-1 opacity-60"
              :style="getBarStyle(props.item.value, props.item.id)"
            />
          </div>
        </div>
      </template>

      <template #leftIcon>
        <UiIconBase
          :color="categoriesStore.items[props.item.id]?.color"
          :name="categoriesStore.items[props.item.id]?.icon"
          size="18"
        />
      </template>

      <div
        :class="{
          'pb-2 pt-1': props.isShowLinesChart,
        }"
      >
        <!-- Parent category name -->
        <div
          v-if="categoriesStore.items[props.item.id].parentId"
          class="text-2xs"
        >
          {{ categoriesStore.items[categoriesStore.items[props.item.id].parentId].name }}
        </div>

        <!-- Category name -->
        <div class="flex items-center gap-2 text-secondary text-sm leading-none">
          {{ categoriesStore.items[props.item.id].name }}
          <!-- Has childs -->
          <div
            v-if="categoriesStore.items[props.item.id].parentId === 0"
            class="text-md font-unica"
          >
            ...
          </div>
        </div>
      </div>

      <div
        :class="{
          'pb-1': props.isShowLinesChart,
        }"
        class="grow pr-1 opacity-90"
      >
        <Amount
          :amount="props.item.value"
          :type="props.item.value >= 0 ? 1 : 0"
          :currencyCode="currenciesStore.base"
          :isShowBaseRate="false"
          colorize="income"
        />
      </div>
    </UiElement>

    <slot />
  </div>
</template>
