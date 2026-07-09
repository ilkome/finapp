<script setup lang="ts">
import type { BudgetId } from '~/components/budgets/types'
import type { BudgetProgress } from '~/components/budgets/useBudgetProgress'

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

// Expense budgets whose assignment actually feeds the to-assign pool, most-assigned first. A
// sinking-fund target only counts when it carries a real funding override - its synthetic set-aside
// never entered the pool, so reducing it wouldn't help. Mirrors toAssignTotal's accounting.
const candidates = computed(() => {
  const out: { assigned: number, id: BudgetId, name: string }[] = []
  for (const [id, b] of Object.entries(budgetsStore.activeItems)) {
    if (b.kind !== 'expense')
      continue
    const p = props.progressFor(id)
    if (!p)
      continue
    const contributing = p.target != null && !p.hasAssignment ? 0 : p.assigned
    if (contributing > 0)
      out.push({ assigned: contributing, id, name: nameOf(id) })
  }
  return out.sort((a, b) => b.assigned - a.assigned)
})

// Trim the largest assignments in turn until the pool is balanced (or candidates run out).
function autoFix(close: () => void) {
  let remaining = props.overBase
  for (const c of [...candidates.value]) {
    if (remaining <= 0.005)
      break
    const cut = Math.min(remaining, c.assigned)
    props.reduceAssignment(c.id, cut)
    remaining -= cut
  }
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

      <div class="bottomSheetContentInside scrollerBlock grid content-start gap-4 px-3 py-2">
        <!-- How far over income the assignments run -->
        <div class="bg-elevated/30 flex items-center justify-between gap-2 rounded-md px-3 py-2">
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

        <div class="text-2xs text-muted px-1">
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
              class="bg-elevated/30 text-muted hover:bg-elevated/50 flex items-center justify-between gap-2 rounded-md px-3 py-2 text-left text-sm"
              @click="reduceOne(c.id, c.assigned)"
            >
              <span class="truncate">{{ c.name }}</span>
              <span class="flex items-center gap-1">
                <Amount :amount="c.assigned" :currencyCode="currenciesStore.base" :isShowBaseRate="false" align="left" variant="xs" />
                <Icon name="lucide:minus" size="12" />
              </span>
            </button>
          </div>
          <div v-else class="text-muted text-sm">
            {{ t('budgets.move.noSource') }}
          </div>
        </FormElement>
      </div>

      <div class="bottomSheetContentBottom">
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
