<script setup lang="ts">
import type { CategoryItem } from '~/components/categories/types'
import type { CurrencyCode } from '~/components/currencies/types'

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
  currencyCode: CurrencyCode
  items: MoverRow[]
}>()

const emit = defineEmits<{
  select: [id: string]
}>()

const { t } = useI18n()
</script>

<template>
  <div class="grid rounded-md bg-elevated/30 py-px" data-analytics-movers>
    <CategoriesItemView
      v-for="(item, index) in props.items"
      :key="item.id"
      :category="item.category"
      :categoryId="item.id"
      chevron="right"
      :data-mover="item.id"
      isShowParent
      :lineWidth="index === props.items.length - 1 ? 0 : 1"
      :parentCategory="item.parentCategory"
      stacked
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
    </CategoriesItemView>
  </div>
</template>
