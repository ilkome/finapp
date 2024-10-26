<script setup lang="ts">
import type { CategoryId } from '~/components/categories/types'
import type { TotalCategory, ViewOptions } from '~/components/stat/types'
import { useCategoriesStore } from '~/components/categories/useCategoriesStore'
import { useCurrenciesStore } from '~/components/currencies/useCurrencies'

const props = defineProps<{
  biggestCatNumber: number
  insideClass?: string
  insideStyle?: string
  isActive?: boolean
  isHideDots?: boolean
  item: TotalCategory
  lineWidth?: number
  viewOptions?: ViewOptions
}>()

const emit = defineEmits<{
  click: [categoryId: CategoryId]
  onClickIcon: [id: CategoryId]
}>()

const categoriesStore = useCategoriesStore()
const currenciesStore = useCurrenciesStore()

const category = computed(() => categoriesStore.items[props.item.id])
const parentCategory = computed(() => categoriesStore.items[category.value?.parentId])

function getBarStyle() {
  return {
    backgroundColor: category.value?.color,
    width: `${(Math.abs(props.item.value) / Math.abs(props.biggestCatNumber ?? 0)) * 100}%`,
  }
}
</script>

<template>
  <div
    :class="[props.insideClass, {
      '-bg-item-4 ': props.isActive,
      'bg-item-9 rounded-lg': props.viewOptions?.catsList.isItemsBg,
      'group': !props.viewOptions?.catsList.isItemsBg,
    }]"
    :style="props.insideStyle"
    class="relative"
  >
    <slot name="before" />
    <UiElement
      :isActive2="props.isActive"
      class="relative"
      isShowToggle2
      insideClasses="!min-h-[44px]"
      :lineWidth="!props.viewOptions?.catsList.isItemsBg ? props.lineWidth : 0"
      @click="emit('click', props.item.id)"
    >
      <template #line>
        <div
          v-if="props.viewOptions?.catsList.isLines"
          class="absolute left-0 bottom-2 w-full pl-[52px] pr-3 rounded-lg overflow-hidden"
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
          v-if="props.viewOptions?.catsList.isRoundIcon"
          :color="category?.color"
          :name="category?.icon"
          invert
          class="!text-base leading-none !w-7 ml-0"
          @click.stop="emit('onClickIcon', props.item.id)"
        />
        <UiIconBase
          v-else
          :color="category?.color"
          :name="category?.icon"
          class="!text-xl leading-none !w-6 ml-1"
          @click.stop="emit('onClickIcon', props.item.id)"
        />
      </template>

      <CategoriesName
        :class="{ '!pb-2': props.viewOptions?.catsList.isLines }"
        :category
        :parentCategory
        :hasChildren="categoriesStore.getChildsIds(props.item.id).length > 0"
      />

      <div
        v-if="props.item.value !== 0"
        :class="{
          '!pb-2': props.viewOptions?.catsList.isLines,
        }"
        class="grow pr-1"
      >
        <Amount
          :amount="props.item.value"
          :type="props.item.value > 0 ? 1 : 0"
          :currencyCode="currenciesStore.base"
          :isShowBaseRate="false"
          :isShowSymbol="props.item.value !== 0"
          colorize="income"
        />
      </div>
    </UiElement>

    <slot />
  </div>
</template>
