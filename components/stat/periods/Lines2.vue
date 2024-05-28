<script setup lang="ts">
import type {
  FilterProvider,
  PeriodNameWithoutAll,
} from '~/components/filter/useFilter'
import type { MoneyTypeSlugSum } from '~/components/stat/types'
import type { StatProvider } from '~/components/stat/useStat'
import { formatDateByPeriod2 } from '~/components/date/format'
import { getStyles } from '~/components/ui/getStyles'
import { useCurrenciesStore } from '~/components/currencies/useCurrencies'
import type { CategoryId } from '~/components/categories/types'
import type { TrnId } from '~/components/trns/types'
import { useCategoriesStore } from '~/components/categories/useCategories'
import useAmount from '~/components/amount/useAmount'
import type { TotalCategory } from '~/components/stat/MiniItem.vue'

const props = withDefaults(
  defineProps<{
    biggest?: number
    cats: TotalCategory[]
    date: number
    isShowLinesChart?: boolean
    period: PeriodNameWithoutAll
    type?: MoneyTypeSlugSum
  }>(),
  {
    type: 'summary',
  },
)

const { t } = useI18n()
const categoriesStore = useCategoriesStore()
const currenciesStore = useCurrenciesStore()

function getBarStyle(amount: number, categoryId: CategoryId) {
  return {
    backgroundColor: categoriesStore.items[categoryId].color,
    width: `${(Math.abs(amount) / Math.abs(props.biggest ?? 0)) * 100}%`,
  }
}

// const formattedDate = computed(() =>
//   formatDateByPeriod2(props.date, props.period, {
//     current: t('dates.week.current'),
//     last: t('dates.week.last'),
//   }),
// )

const opened = ref<CategoryId[]>([])
</script>

<template>
  <div v-if="cats?.length > 0" class="grid gap-3">
    <UiTitle class="flex items-baseline gap-2">
      <div>{{ $t('categories.title') }}</div>
      <div v-if="cats.length > 0" class="text-sm">
        {{ cats.length }}
      </div>
    </UiTitle>

    <slot name="contentBefore" />

    <div>
      <UiElement
        v-for="item in cats"
        :key="item.id"
        class="relative group"
        :isShowLine="!props.isShowLinesChart"
        @click="
          opened.includes(item.id)
            ? (opened = opened.filter((d) => d !== item.id))
            : opened.push(item.id)
        "
      >
        <template #line>
          <div
            v-if="props.isShowLinesChart"
            class="absolute left-0 bottom-2 w-full pl-11 pr-3 rounded-lg overflow-hidden"
          >
            <div class="bg-item-3 rounded-lg overflow-hidden">
              <div
                class="h-1 opacity-60"
                :style="getBarStyle(item.value, item.id)"
              />
            </div>
          </div>
        </template>

        <template #leftIcon>
          <Icon
            :color="categoriesStore.items[item.id]?.color"
            :name="categoriesStore.items[item.id]?.icon.replace('mdi mdi-', 'mdi:')"
          />
        </template>

        <div
          :class="{
            'pb-2 pt-1': props.isShowLinesChart,
          }"
        >
          <!-- Parent category name -->
          <div
            v-if="categoriesStore.items[item.id].parentId"
            class="text-2xs"
          >
            {{ categoriesStore.items[categoriesStore.items[item.id].parentId].name }}
          </div>

          <!-- Category name -->
          <div class="flex items-center gap-2 text-secondary text-sm leading-none">
            {{ categoriesStore.items[item.id].name }}
            <!-- Has childs -->
            <div
              v-if="categoriesStore.items[item.id].parentId === 0"
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
          class="grow pr-1 opacity-90 "
        >
          <Amount
            :amount="item.value"
            :currencyCode="currenciesStore.base"
            :isShowBaseRate="false"
          />
        </div>
      </UiElement>
    </div>
  </div>
</template>
