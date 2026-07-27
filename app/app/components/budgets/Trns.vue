<script setup lang="ts">
import type { BudgetId } from '~/components/budgets/types'
import type { TrnId } from '~/components/trns/types'

import { useBudgetsStore } from '~/components/budgets/useBudgetsStore'
import { useCategoriesStore } from '~/components/categories/useCategoriesStore'

const props = defineProps<{
  budgetId: BudgetId
  periodLabel: string
  trnsIds: TrnId[]
}>()

const emit = defineEmits<{
  closed: []
}>()

const { t } = useI18n()
const budgetsStore = useBudgetsStore()
const categoriesStore = useCategoriesStore()

const name = computed(() => {
  const catId = budgetsStore.items?.[props.budgetId]?.categoryId
  return (catId && categoriesStore.items?.[catId]?.name) || catId || props.budgetId
})
</script>

<template>
  <BottomSheetModal @closed="emit('closed')">
    <template #default>
      <UiTitleModal>
        {{ name }} · {{ periodLabel }}
      </UiTitleModal>

      <div class="bottomSheetContentInside scrollerBlock px-3 py-2">
        <div v-if="!trnsIds.length" class="py-6 text-center text-sm text-muted">
          {{ t('budgets.trns.empty') }}
        </div>
        <TrnsList
          v-else
          :trnsIds="trnsIds"
          isShowDates
          isShowExpense
          isShowGroupSum
          isShowIncome
          isShowTransfers
        />
      </div>
    </template>
  </BottomSheetModal>
</template>
