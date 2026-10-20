<script setup lang="ts">
import type { CategoryItem } from '~/components/categories/types'
import type { CurrencyCode } from '~/components/currencies/types'
import type { RowBackgroundType } from '~/components/ui/RowBackground.vue'

export type MoverRow = {
  category: CategoryItem
  current: number
  delta: number
  /** Formatted change in percent; absent for a category new in this period. */
  deltaLabel?: string
  id: string
  /** One trn makes most of the change. */
  isOneOff?: boolean
  parentCategory?: CategoryItem
}

const props = defineProps<{
  /** Category rows follow the categories view setting. */
  backgroundType?: RowBackgroundType
  currencyCode: CurrencyCode
  isRoundIcon?: boolean
  items: MoverRow[]
}>()

const emit = defineEmits<{
  select: [id: string]
}>()

const { t } = useI18n()
</script>

<template>
  <div class="grid gap-1" data-analytics-movers>
    <CategoriesRowView
      v-for="item in props.items"
      :key="item.id"
      :category="item.category"
      :categoryId="item.id"
      chevron="right"
      :data-mover="item.id"
      :backgroundType="props.backgroundType"
      :isRoundIcon="props.isRoundIcon"
      :parentCategory="item.parentCategory"
      @click="emit('select', item.id)"
    >
      <template #append>
        <UBadge v-if="item.isOneOff" color="neutral" variant="subtle" size="sm" :label="t('wallets.analytics.movers.oneOff')" data-mover-one-off />
        <div class="grid justify-items-end gap-1 pr-1">
          <Amount :amount="-item.current" :currencyCode="props.currencyCode" :isShowBaseRate="false" variant="row" />
          <div class="flex items-center gap-1" :class="item.delta > 0 ? 'text-expense-1' : 'text-income-1'">
            <Amount :amount="item.delta" :currencyCode="props.currencyCode" :isShowBaseRate="false" isShowPlus variant="secondary" />
            <UiText v-if="item.deltaLabel" variant="caption">
              {{ item.deltaLabel }}
            </UiText>
          </div>
        </div>
      </template>
    </CategoriesRowView>
  </div>
</template>
