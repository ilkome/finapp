<script setup lang="ts">
import type { CategoryId } from '~/components/categories/types'
import type { TotalCategory } from '~/components/stat/useNewStat'
import { useCategoriesStore } from '~/components/categories/useCategories'
import { useCurrenciesStore } from '~/components/currencies/useCurrencies'
import { useTrnsStore } from '~/components/trns/useTrnsStore'

const props = defineProps<{
  biggestCatNumber: number
  isActive?: boolean
  isAltIcon?: boolean
  isShowLinesChart?: boolean
  item: TotalCategory
}>()

const emit = defineEmits<{
  click: [categoryId: CategoryId]
  onClickIcon: [id: CategoryId]
}>()

const categoriesStore = useCategoriesStore()
const currenciesStore = useCurrenciesStore()
const trnsStore = useTrnsStore()

const category = computed(() => {
  const isOneCategory = props.item.trnsIds.length <= 1
  const isParentCategory = categoriesStore.items[props.item.id]?.parentId === 0

  const isDifferentCategories = props.item.trnsIds.some(id =>
    trnsStore.items[id]?.categoryId !== trnsStore.items[props.item.trnsIds[0]]?.categoryId)

  if (isParentCategory && (!isDifferentCategories || isOneCategory)) {
    const parentId = trnsStore.items[props.item.trnsIds[0]].categoryId
    return categoriesStore.items[parentId]
  }

  return categoriesStore.items[props.item.id]
})

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
    class="group bg-item-4 rounded-md"
  >
    <UiElement
      :isShowLine2="!props.isShowLinesChart"
      :isActive2="props.isActive"
      class="relative"
      isShowToggle2
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
          class="!text-xl !w-6"
          @click.stop="emit('onClickIcon', props.item.id)"
        />
        <UiIconBase
          v-else
          :color="category?.color"
          :name="category?.icon"
          invert
          class="!text-xl !w-8"
          @click.stop="emit('onClickIcon', props.item.id)"
        />
      </template>

      <div
        :class="{
          'pb-2 pt-1': props.isShowLinesChart,
        }"
        class="grid gap-1"
      >
        <!-- Parent category name -->
        <div
          v-if="category?.parentId"
          class="text-2xs"
        >
          {{ categoriesStore.items[category?.parentId]?.name }}
        </div>

        <!-- Category name -->
        <div class="flex items-center gap-2 text-secondary text-sm leading-none">
          {{ category?.name }}
          <!-- Has childs -->
          <div
            v-if="category?.parentId === 0"
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
