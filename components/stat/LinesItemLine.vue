<script setup lang="ts">
import type { CategoryId } from '~/components/categories/types'
import type { TotalCategory } from '~/components/stat/useNewStat'
import { useCategoriesStore } from '~/components/categories/useCategories'
import { useCurrenciesStore } from '~/components/currencies/useCurrencies'

const props = defineProps<{
  biggestCatNumber: number
  isActive?: boolean
  isAltIcon?: boolean
  isGroupCategoriesByParent?: boolean
  isShowLinesChart?: boolean
  item: TotalCategory
}>()

const emit = defineEmits<{
  click: [categoryId: CategoryId]
  onClickIcon: [id: CategoryId]
}>()

const categoriesStore = useCategoriesStore()
const currenciesStore = useCurrenciesStore()

const category = computed(() => categoriesStore.items[props.item.id])

function getBarStyle() {
  return {
    backgroundColor: category.value?.color,
    width: `${(Math.abs(props.item.value) / Math.abs(props.biggestCatNumber ?? 0)) * 100}%`,
  }
}
</script>

<template>
  <div
    :class="{
      '-bg-item-4 ': props.isActive,
    }"
    class="group -bg-item-4 -rounded-md"
  >
    <UiElement
      :isShowLine2="!props.isShowLinesChart"
      :isActive2="props.isActive"
      class="relative"
      isShowToggle2
      :lineWidth="isShowLinesChart ? 0 : 1"
      @click="emit('click', props.item.id)"
    >
      <template #line>
        <div
          v-if="props.isShowLinesChart"
          class="absolute left-0 bottom-2 w-full pl-12 pr-3 rounded-lg overflow-hidden"
        >
          <div class="bg-item-3 rounded-lg overflow-hidden">
            <div
              class="h-1 opacity-60"
              :style="getBarStyle()"
            />
          </div>
        </div>
      </template>

      <template #leftIcon>
        <UiIconBase
          v-if="isAltIcon"
          :color="category?.color"
          :name="category?.icon"
          class="!text-xl !w-6 ml-1"
          @click.stop="emit('onClickIcon', props.item.id)"
        />
        <UiIconBase
          v-else
          :color="category?.color"
          :name="category?.icon"
          invert
          class="!text-xl !w-8 ml-2"
          @click.stop="emit('onClickIcon', props.item.id)"
        />
      </template>

      <div
        :class="{
          'pb-2 pt-1': props.isShowLinesChart,
        }"
        class="flex gap-3 items-baseline"
      >
        <!-- Category name -->
        <div class="flex items-center gap-2 text-3 text-sm leading-none">
          {{ category?.name }}
          <!-- Has childs -->
          <div
            v-if="category?.parentId === 0"
            class="leading-none text-sm text-4"
          >
            ...
          </div>
        </div>

        <!-- Parent category name -->
        <div
          v-if="category?.parentId"
          class="leading-none text-2xs text-4"
        >
          •
        </div>

        <div
          v-if="category?.parentId"
          class="leading-none text-2xs text-4"
        >
          {{ categoriesStore.items[category?.parentId]?.name }}
        </div>
      </div>

      <div
        :class="{
          'pb-1': props.isShowLinesChart,
        }"
        class="grow pr-1"
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
