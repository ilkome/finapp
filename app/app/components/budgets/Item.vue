<script setup lang="ts">
import type { BudgetId, BudgetItem } from '~/components/budgets/types'
import type { BudgetProgress } from '~/components/budgets/useBudgetProgress'

import { useBudgetMenuItems } from '~/components/budgets/useBudgetMenuItems'
import { useBudgetsStore } from '~/components/budgets/useBudgetsStore'
import { useCategoriesStore } from '~/components/categories/useCategoriesStore'
import { useCurrenciesStore } from '~/components/currencies/useCurrenciesStore'
import { formatByLocale } from '~/components/date/utils'

const props = defineProps<{
  budget: BudgetItem
  id: BudgetId
  periodStart: number
  progress: BudgetProgress
}>()

const emit = defineEmits<{
  edit: [id: BudgetId]
  history: [id: BudgetId]
  move: [id: BudgetId]
}>()

const { locale, t } = useI18n()
const budgetsStore = useBudgetsStore()
const categoriesStore = useCategoriesStore()
const currenciesStore = useCurrenciesStore()
const m = useBudgetMenuItems()

const dateLocale = computed(() => locale.value.startsWith('ru') ? 'ru' : 'en')
const goalDateLabel = computed(() => props.progress.target ? formatByLocale(props.progress.target.goalDate, 'd MMM yyyy', dateLocale.value) : '')
const targetPct = computed(() => props.progress.target ? Math.round(props.progress.target.pct * 100) : 0)

const isArchived = computed(() => props.budget.status === 'archived')
const confirmDelete = ref(false)
function askDelete() {
  confirmDelete.value = true
}

// Restoring is refused by the store when another active budget already covers this category+kind;
// offer to archive that one and restore this. (A2)
const unarchiveConflictId = ref<BudgetId | undefined>()
function onUnarchive(id: BudgetId) {
  const res = budgetsStore.unarchiveBudget(id)
  if (!res.ok && res.conflictId)
    unarchiveConflictId.value = res.conflictId
}
function confirmUnarchiveReplace() {
  if (unarchiveConflictId.value) {
    budgetsStore.archiveBudget(unarchiveConflictId.value)
    budgetsStore.unarchiveBudget(props.id)
  }
}

const contextMenuItems = computed(() => {
  const lifecycle = isArchived.value
    ? m.unarchive(props.id, onUnarchive)
    : m.archive(props.id, id => budgetsStore.archiveBudget(id))
  const primary = [m.edit(props.id, id => emit('edit', id))]
  if (!isArchived.value) {
    primary.push(m.move(props.id, id => emit('move', id)))
    primary.push(m.history(props.id, id => emit('history', id)))
  }
  primary.push(lifecycle)
  return [primary, [m.delete(props.id, askDelete)]]
})

// Per-period assignment override: tap "Assigned" to set this period's limit (in the budget's own
// currency), or reset to the normalized default. The read side is already in effectiveAssigned.
const assignCurrency = computed(() => props.budget.currency || currenciesStore.base)
const editingAssign = ref(false)
const assignInput = ref('')
function openAssign() {
  assignInput.value = String(Math.round(props.progress.assignedRaw * 100) / 100)
  editingAssign.value = true
}
function saveAssign() {
  const n = Number.parseFloat(assignInput.value)
  if (Number.isFinite(n) && n >= 0)
    budgetsStore.setAssignment(props.id, props.periodStart, n)
  editingAssign.value = false
}
function resetAssign() {
  budgetsStore.clearAssignment(props.id, props.periodStart)
  editingAssign.value = false
}

const category = computed(() => categoriesStore.items?.[props.budget.categoryId])
// Show the parent under a subcategory budget (mirrors the trn form) so it's clear which level is budgeted.
const parentCategory = computed(() => category.value?.parentId ? categoriesStore.items?.[category.value.parentId] : undefined)

function pct(value: number, of: number): number {
  if (of <= 0)
    return 0
  return Math.max(0, Math.min(100, (value / of) * 100))
}

// Bar fills toward the assigned amount; over-budget paints the whole bar in the error color.
const fillPct = computed(() => pct(props.progress.activity, props.progress.assigned))
const pacePct = computed(() => pct(props.progress.pace, props.progress.assigned))

// Income budgets are goals: more = good. They never go "over" (received past the target is a
// surplus, shown green) and count "left to receive" down to 0 rather than into the negative.
const isIncome = computed(() => props.budget.kind === 'income')
const isOver = computed(() => props.progress.isOver)
const isGoalReached = computed(() => props.progress.isGoalReached)
const remaining = computed(() => isIncome.value ? Math.max(0, props.progress.available) : props.progress.available)
const surplus = computed(() => props.progress.activity - props.progress.assigned)
const remainingClass = computed(() => isOver.value ? 'text-error' : isGoalReached.value ? 'text-success' : 'text-highlighted')
const barClass = computed(() => isOver.value ? 'bg-error' : isGoalReached.value ? 'bg-success' : 'bg-primary')
</script>

<template>
  <UiContextMenuMy :items="contextMenuItems">
    <div class="bg-elevated interactive rounded-md px-3 py-2" :class="{ 'opacity-60': isArchived }" @click="emit('edit', props.id)">
      <div class="flex items-center gap-2">
        <div
          class="flex size-8 shrink-0 items-center justify-center rounded-full"
          :style="{ background: category?.color ?? 'var(--ui-bg-accented)' }"
        >
          <Icon :name="category?.icon ?? 'lucide:folder'" size="18" class="text-white" />
        </div>

        <div class="min-w-0 grow">
          <div class="text-highlighted truncate text-sm">
            {{ category?.name ?? props.budget.categoryId }}
          </div>
          <div v-if="parentCategory" class="text-2xs text-muted truncate leading-none">
            {{ parentCategory.name }}
          </div>
          <div class="text-2xs text-muted">
            {{ t(`budgets.kind.${props.budget.kind}`) }}
            · {{ t(`budgets.periodUnit.${props.budget.amountPeriod}`) }}
            <template v-if="props.budget.currency && props.budget.currency !== currenciesStore.base">
              · {{ props.budget.currency }}
            </template>
            <template v-if="props.budget.rollover !== 'none'">
              · {{ t(`budgets.rollover.${props.budget.rollover}`) }}
            </template>
          </div>
        </div>
      </div>

      <!-- Triad: expense = Spent/Assigned/Available; income = Received/Expected/Left to receive. -->
      <div class="text-2xs mt-2 flex items-center justify-between gap-2">
        <div class="text-muted">
          {{ t(`budgets.triad.${budget.kind}.activity`) }}
          <Amount :amount="progress.activity" :currencyCode="currenciesStore.base" :isShowBaseRate="false" align="left" variant="xs" />
        </div>
        <button type="button" class="text-muted hover:text-highlighted text-left" @click.stop="openAssign">
          <span class="inline-flex items-center gap-0.5">
            {{ t(`budgets.triad.${budget.kind}.assigned`) }}
            <Icon name="lucide:pencil" size="9" :class="progress.hasAssignment ? 'text-primary' : 'text-muted/40'" />
          </span>
          <Amount :amount="progress.assigned" :currencyCode="currenciesStore.base" :isShowBaseRate="false" align="left" variant="xs" />
        </button>
        <div :class="remainingClass">
          {{ t(`budgets.triad.${budget.kind}.remaining`) }}
          <Amount :amount="remaining" :currencyCode="currenciesStore.base" :isShowBaseRate="false" align="left" variant="xs" />
        </div>
      </div>

      <!-- Per-period assignment override editor -->
      <div v-if="editingAssign" class="bg-default/60 mt-2 flex flex-wrap items-center gap-2 rounded-md p-2" @click.stop>
        <input
          v-model="assignInput"
          type="number"
          inputmode="decimal"
          class="bg-elevated text-highlighted w-24 rounded-sm px-2 py-1 text-sm"
          @keydown.enter="saveAssign"
        >
        <span class="text-2xs text-muted">{{ assignCurrency }} · {{ t('budgets.assign.forPeriod') }}</span>
        <span class="grow" />
        <button type="button" class="bg-primary text-icon-primary text-2xs rounded-sm px-2 py-1" @click="saveAssign">
          {{ t('base.save') }}
        </button>
        <button v-if="progress.hasAssignment" type="button" class="bg-default text-2xs text-muted hover:text-highlighted rounded-sm px-2 py-1" @click="resetAssign">
          {{ t('budgets.assign.reset') }}
        </button>
        <button type="button" class="text-2xs text-muted hover:text-highlighted px-2 py-1" @click="editingAssign = false">
          {{ t('base.cancel') }}
        </button>
      </div>

      <!-- Progress bar with pace marker -->
      <div class="bg-default relative mt-2 h-2 rounded-full">
        <div
          class="h-full rounded-full transition-all"
          :class="barClass"
          :style="{ width: `${fillPct}%` }"
        />
        <!-- Pace = where spending "should" be by now; contrasts against both the track and the fill. -->
        <div
          v-if="pacePct > 0 && pacePct < 100"
          class="bg-inverted ring-default absolute -top-1 h-4 w-[3px] -translate-x-1/2 rounded-full ring-1"
          :style="{ left: `${pacePct}%` }"
          :title="t('budgets.pace')"
        />
      </div>

      <!-- Rollover + projection + committed -->
      <div class="text-2xs text-muted mt-1 flex flex-wrap items-center gap-x-3 gap-y-0.5">
        <span v-if="progress.carried !== 0" class="flex items-center gap-1">
          <Icon name="lucide:rotate-ccw" size="11" />
          {{ t('budgets.carried') }}
          <Amount :amount="progress.carried" :currencyCode="currenciesStore.base" :isShowBaseRate="false" :isShowPlus="progress.carried > 0" align="left" variant="xs" />
        </span>
        <span class="flex items-center gap-1">
          {{ t('budgets.projected') }}
          <Amount :amount="progress.projected" :currencyCode="currenciesStore.base" :isShowBaseRate="false" align="left" variant="xs" />
        </span>
        <span v-if="!isIncome && progress.committed > 0" class="flex items-center gap-1">
          <Amount :amount="progress.committed" :currencyCode="currenciesStore.base" :isShowBaseRate="false" align="left" variant="xs" />
          {{ t('budgets.committed') }}
        </span>
        <span v-if="isOver" class="text-error">{{ t('budgets.overBudget') }}</span>
        <span v-if="isGoalReached" class="text-success flex items-center gap-1">
          {{ t('budgets.goalReached') }}
          <Amount v-if="surplus > 0" :amount="surplus" :currencyCode="currenciesStore.base" :isShowBaseRate="false" :isShowPlus="true" align="left" variant="xs" />
        </span>
      </div>

      <!-- Sinking-fund target: accumulated set-aside toward the goal by the goal date. -->
      <div v-if="progress.target" class="mt-1.5">
        <div
          class="text-2xs flex flex-wrap items-center gap-x-1.5 gap-y-0.5"
          :class="progress.target.reached ? 'text-success' : 'text-primary'"
        >
          <Icon :name="progress.target.reached ? 'lucide:check' : 'lucide:target'" size="11" />
          <Amount :amount="progress.target.saved" :currencyCode="currenciesStore.base" :isShowBaseRate="false" align="left" variant="xs" />
          <span class="text-muted">/</span>
          <Amount :amount="progress.target.goalAmount" :currencyCode="currenciesStore.base" :isShowBaseRate="false" align="left" variant="xs" />
          <span v-if="progress.target.reached">· {{ t('budgets.target.reached') }}</span>
          <span v-else class="text-muted">· {{ targetPct }}% · {{ t('budgets.target.by', { date: goalDateLabel }) }}</span>
        </div>
        <div class="bg-default mt-1 h-1 rounded-full">
          <div
            class="h-full rounded-full transition-all"
            :class="progress.target.reached ? 'bg-success' : 'bg-primary'"
            :style="{ width: `${targetPct}%` }"
          />
        </div>
      </div>
    </div>
  </UiContextMenuMy>

  <LayoutConfirmModal
    v-if="confirmDelete"
    :title="t('budgets.confirm.deleteTitle')"
    :description="t('budgets.confirm.deleteText')"
    @closed="confirmDelete = false"
    @confirm="budgetsStore.removeBudget(props.id)"
  />

  <LayoutConfirmModal
    v-if="unarchiveConflictId"
    :confirmLabel="t('budgets.unarchive')"
    :description="t('budgets.confirm.unarchiveText', { category: category?.name ?? '' })"
    :title="t('budgets.confirm.unarchiveTitle')"
    @closed="unarchiveConflictId = undefined"
    @confirm="confirmUnarchiveReplace"
  />
</template>
