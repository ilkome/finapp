<script setup lang="ts">
import type { ReduceCandidateInput } from '~/components/budgets/compute'
import type { BudgetId } from '~/components/budgets/types'
import type { BudgetProgress } from '~/components/budgets/useBudgetProgress'

import { greedyReduceCuts, reduceCandidates } from '~/components/budgets/compute'
import { useBudgetsStore } from '~/components/budgets/useBudgetsStore'
import { useCategoriesStore } from '~/components/categories/useCategoriesStore'
import { useCurrenciesStore } from '~/components/currencies/useCurrenciesStore'

const props = defineProps<{
  // How much the to-assign pool is over-assigned (base currency, > 0).
  overBase: number
  progressFor: (id: BudgetId) => BudgetProgress | undefined
  reduceAssignment: (id: BudgetId, baseAmount: number) => void
}>()

const emit = defineEmits<{
  closed: []
}>()

const { t } = useI18n()
const budgetsStore = useBudgetsStore()
const categoriesStore = useCategoriesStore()
const currenciesStore = useCurrenciesStore()

function nameOf(id: BudgetId) {
  const catId = budgetsStore.items?.[id]?.categoryId
  return (catId && categoriesStore.items?.[catId]?.name) || catId || id
}

// Expense budgets whose assignment actually feeds the to-assign pool, most-assigned first. The
// contribution rule (assignedPoolContribution, inside reduceCandidates) is shared with
// toAssignTotal so the sheet mirrors the pool's accounting by construction.
const candidates = computed(() => {
  const inputs: ReduceCandidateInput[] = []
  for (const [id, b] of Object.entries(budgetsStore.activeItems)) {
    // Pre-filter so progressFor (the expensive part) never runs for income budgets.
    if (b.kind !== 'expense')
      continue
    const p = props.progressFor(id)
    if (!p)
      continue
    inputs.push({ assigned: p.assigned, hasAssignment: p.hasAssignment, id, isTarget: p.target != null, kind: b.kind })
  }
  return reduceCandidates(inputs).map(c => ({ ...c, name: nameOf(c.id) }))
})

// Trim the largest assignments in turn until the pool is balanced (or candidates run out). All cuts
// come from the same pre-mutation snapshot: the computed only recomputes after setAssignment fires.
function autoFix(close: () => void) {
  for (const { cut, id } of greedyReduceCuts(props.overBase, candidates.value))
    props.reduceAssignment(id, cut)
  close()
}

// Reduce a single budget by whatever is still over-assigned (capped at its own assignment). The pool
// recomputes reactively, so the sheet stays open for another tap if it's still negative.
function reduceOne(id: BudgetId, assigned: number) {
  props.reduceAssignment(id, Math.min(props.overBase, assigned))
}
</script>

<template>
  <BottomSheetModal @closed="emit('closed')">
    <template #default="{ close }">
      <UiTitleModal>
        {{ t('budgets.toAssign.title') }}
      </UiTitleModal>

      <div class="bottom-sheet-content-inside grid scroller-block content-start gap-4 px-3 py-2">
        <!-- How far over income the assignments run -->
        <div class="flex items-center justify-between gap-2 rounded-md bg-elevated/30 px-3 py-2">
          <span class="text-2xs text-muted">{{ t('budgets.toAssign.over') }}</span>
          <span class="grow" />
          <Amount
            :amount="overBase"
            :currencyCode="currenciesStore.base"
            :isShowBaseRate="false"
            align="left"
            colorize="expense"
            variant="sm"
          />
        </div>

        <div class="px-1 text-2xs text-muted">
          {{ t('budgets.toAssign.text') }}
        </div>

        <!-- Budgets to pull from (most-assigned first) -->
        <FormElement>
          <template #label>
            {{ t('budgets.hero.toAssign') }}
          </template>
          <div v-if="candidates.length" class="grid gap-1">
            <button
              v-for="c in candidates"
              :key="c.id"
              type="button"
              class="flex items-center justify-between gap-2 rounded-md bg-elevated/30 px-3 py-2 text-left text-sm text-muted hover:bg-elevated/50"
              @click="reduceOne(c.id, c.assigned)"
            >
              <span class="truncate">{{ c.name }}</span>
              <span class="flex items-center gap-1">
                <Amount :amount="c.assigned" :currencyCode="currenciesStore.base" :isShowBaseRate="false" align="left" variant="xs" />
                <Icon name="lucide:minus" size="12" />
              </span>
            </button>
          </div>
          <div v-else class="text-sm text-muted">
            {{ t('budgets.move.noSource') }}
          </div>
        </FormElement>
      </div>

      <div class="bottom-sheet-content-bottom">
        <UiButtonAccent
          class="sm:max-w-xs"
          rounded
          :disabled="!candidates.length || overBase <= 0"
          @click="autoFix(close)"
        >
          {{ t('budgets.toAssign.balance') }}
        </UiButtonAccent>
      </div>
    </template>
  </BottomSheetModal>
</template>
