<script setup lang="ts">
import type { CategoryId } from '~/components/categories/types'
import type { TotalCategory } from '~/components/stat/useNewStat'
import { useCategoriesStore } from '~/components/categories/useCategories'
import { useCurrenciesStore } from '~/components/currencies/useCurrencies'
import type { ViewOptions } from '~/components/stat/types'

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
      insideClasses="!min-h-[48px]"
      :lineWidth="!props.viewOptions?.catsList.isItemsBg && props.lineWidth"
      @click="emit('click', props.item.id)"
    >
      <template #line>
        <div
          v-if="props.viewOptions?.catsList.isLines"
          class="absolute left-0 bottom-3 w-full pl-12 pr-3 rounded-lg overflow-hidden"
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
          class="!text-xl leading-none !w-6 ml-1"
          @click.stop="emit('onClickIcon', props.item.id)"
        />
        <UiIconBase
          v-else
          :color="category?.color"
          :name="category?.icon"
          invert
          class="!text-base leading-none !w-7 ml-0"
          @click.stop="emit('onClickIcon', props.item.id)"
        />
      </template>

      <div
        :class="{
          '!pb-2': props.viewOptions?.catsList.isLines,
        }"
        class="flex gap-3 items-baseline pt-0"
      >
        <!-- Category name -->
        <div class="flex items-center gap-2 text-3 text-sm leading-none">
          {{ category?.name }}
          <!-- Has childs -->
          <div
            v-if="!isHideDots && categoriesStore.hasChildren(props.item.id)"
            class="leading-none text-sm text-4"
          >
            ...
          </div>
        </div>

        <!-- Parent category name -->
        <template v-if="!categoriesStore.hasChildren(props.item.id) && category?.parentId">
          <div class="leading-none text-2xs text-4">
            •
          </div>

          <div class="leading-none text-2xs text-4">
            {{ categoriesStore.items[category?.parentId]?.name }}
          </div>
        </template>
      </div>

      <div
        v-if="props.item.value !== 0"
        :class="{
          'pt-0': props.viewOptions?.catsList.isLines,
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
