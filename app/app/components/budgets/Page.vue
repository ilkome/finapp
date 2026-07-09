<script setup lang="ts">
import { UTCDate } from '@date-fns/utc'

import type { BudgetId, BudgetPeriodType } from '~/components/budgets/types'

import { budgetPeriodTypes } from '~/components/budgets/types'
import { useBudgetPeriod } from '~/components/budgets/useBudgetPeriod'
import { useBudgetProgress } from '~/components/budgets/useBudgetProgress'
import { useBudgetsStore } from '~/components/budgets/useBudgetsStore'
import { formatByLocale, getStartOf } from '~/components/date/utils'
import { useTrnsStore } from '~/components/trns/useTrnsStore'

const { locale, t } = useI18n()
const budgetsStore = useBudgetsStore()
const trnsStore = useTrnsStore()

const { openDocs } = useDocsLink()
const period = useBudgetPeriod()
const { copyLastPeriod, historyFor, moveMoney, periodIncomeTotal, progressFor, reduceAssignment, safeToSpendTotal, toAssignTotal, trnsIdsFor } = useBudgetProgress(period)

// "To assign" is an envelope figure (income - assigned). Without period income it's just -assigned,
// which is confusing in limits mode, so only surface it once income lands this period. (A4)
const showToAssign = computed(() => periodIncomeTotal.value > 0)

const hasActiveItems = computed(() => Object.keys(budgetsStore.activeItems).length > 0)

// Paging into the past stops at the earliest period with activity OR an explicit assignment - older
// periods carry no signal. A limit set in an otherwise-empty past period must stay reachable.
const earliestTrnDate = computed(() => {
  let min = Number.POSITIVE_INFINITY
  for (const trn of Object.values(trnsStore.items ?? {})) {
    if (trn.date < min)
      min = trn.date
  }
  return min === Number.POSITIVE_INFINITY ? null : min
})

const earliestAssignmentStart = computed(() => {
  let min = Number.POSITIVE_INFINITY
  for (const a of Object.values(budgetsStore.assignments ?? {})) {
    if (a.periodStart < min)
      min = a.periodStart
  }
  return min === Number.POSITIVE_INFINITY ? null : min
})

const earliestPeriodStart = computed(() => {
  const bounds: number[] = []
  if (earliestTrnDate.value != null)
    bounds.push(getStartOf(new UTCDate(earliestTrnDate.value), period.periodType.value).getTime())
  if (earliestAssignmentStart.value != null)
    bounds.push(getStartOf(new UTCDate(earliestAssignmentStart.value), period.periodType.value).getTime())
  return bounds.length ? Math.min(...bounds) : null
})

const canGoPrev = computed(() => earliestPeriodStart.value != null && period.range.value.start > earliestPeriodStart.value)

// Forward paging: up to a year of periods ahead (plan / pre-assign / reach a goal date).
const MAX_FUTURE_OFFSET = 12
const canGoNext = computed(() => period.offset.value < MAX_FUTURE_OFFSET)

function goPrev() {
  if (canGoPrev.value)
    period.prev()
}
function goNext() {
  if (canGoNext.value)
    period.next()
}
function onNav(action: 'next' | 'prev' | 'today') {
  if (action === 'prev')
    goPrev()
  else if (action === 'next')
    goNext()
  else
    period.reset()
}

useHead({ title: t('budgets.title') })

const showForm = ref(false)
const editingId = ref<BudgetId | undefined>()
const confirmAutoAssign = ref(false)
const showReduceAssign = ref(false)

function openCreate() {
  editingId.value = undefined
  showForm.value = true
}

function openEdit(id: BudgetId) {
  editingId.value = id
  showForm.value = true
}

function onFormClosed() {
  showForm.value = false
  editingId.value = undefined
}

// Move money: the opened budget is the destination; the sheet picks the source.
const movingToId = ref<BudgetId | undefined>()
function openMove(id: BudgetId) {
  movingToId.value = id
}

// Per-budget history sheet.
const historyId = ref<BudgetId | undefined>()
function openHistory(id: BudgetId) {
  historyId.value = id
}

// Drill-through: the transactions behind a budget's "Spent" figure this period.
const trnsId = ref<BudgetId | undefined>()
function openTrns(id: BudgetId) {
  trnsId.value = id
}
function onMoveConfirm(fromId: BudgetId, amount: number) {
  if (movingToId.value)
    moveMoney(fromId, movingToId.value, amount)
  movingToId.value = undefined
}

const dateLocale = computed(() => locale.value.startsWith('ru') ? 'ru' : 'en')

const periodLabel = computed(() => {
  const type = period.periodType.value
  if (type === 'year')
    return formatByLocale(period.range.value.start, 'yyyy', dateLocale.value)
  if (type === 'month')
    return formatByLocale(period.range.value.start, 'LLLL yyyy', dateLocale.value)
  return `${formatByLocale(period.range.value.start, 'd MMM', dateLocale.value)} – ${formatByLocale(period.range.value.end, 'd MMM', dateLocale.value)}`
})

function setPeriodType(type: BudgetPeriodType) {
  period.periodType.value = type
  period.reset()
}
</script>

<template>
  <UiPage>
    <UiHeader>
      <UiHeaderTitle>{{ t('budgets.title') }}</UiHeaderTitle>
      <template #actions>
        <UiActionButton :ariaLabel="t('budgets.add')" @click="openCreate">
          <Icon name="lucide:plus" size="22" />
        </UiActionButton>
        <UiActionButton :ariaLabel="t('budgets.help.open')" @click="openDocs('guide/budgets')">
          <Icon name="lucide:circle-help" size="20" />
        </UiActionButton>
      </template>
    </UiHeader>

    <div class="grid max-w-3xl gap-4 px-2 pb-10 lg:px-4">
      <!-- Period type + navigation -->
      <div class="flex flex-wrap items-center justify-between gap-2">
        <div class="flex gap-1">
          <UiTabsItemPill
            v-for="type in budgetPeriodTypes"
            :key="type"
            :isActive="period.periodType.value === type"
            variant="outline"
            @click="setPeriodType(type)"
          >
            {{ t(`budgets.period.${type}`) }}
          </UiTabsItemPill>
        </div>

        <DateNav
          :isEnd="!canGoNext"
          :isShowNavHome="period.offset.value !== 0"
          :isStart="!canGoPrev"
          @changeDate="onNav"
        >
          <UiActionButton variant="text" @click="period.reset()">
            {{ periodLabel }}
          </UiActionButton>
        </DateNav>
      </div>

      <template v-if="budgetsStore.isReady">
        <!-- Hero: safe to spend + to assign (only meaningful with at least one active budget) -->
        <template v-if="hasActiveItems">
          <div class="grid grid-cols-1 gap-2" :class="{ 'sm:grid-cols-2': showToAssign }">
            <StatSumItem
              :amount="safeToSpendTotal"
              :title="t('budgets.hero.safeToSpend')"
              :type="safeToSpendTotal < 0 ? 'expense' : 'income'"
            />
            <StatSumItem
              v-if="showToAssign"
              :amount="toAssignTotal"
              :title="t('budgets.hero.toAssign')"
              :type="toAssignTotal < 0 ? 'expense' : 'income'"
            />
          </div>
          <div class="-mt-2 flex justify-end gap-1">
            <UiActionButton
              v-if="showToAssign && toAssignTotal < 0"
              class="text-error"
              variant="text"
              size="sm"
              @click="showReduceAssign = true"
            >
              <Icon name="lucide:wand-2" size="14" class="mr-1" />
              {{ t('budgets.toAssign.fix') }}
            </UiActionButton>
            <UiActionButton variant="text" size="sm" @click="confirmAutoAssign = true">
              <Icon name="lucide:copy" size="14" class="mr-1" />
              {{ t('budgets.autoAssign') }}
            </UiActionButton>
          </div>
        </template>

        <!-- Empty (no active budgets - archived-only falls here too, with the archived list below) -->
        <div v-if="!hasActiveItems" class="flex-center grow flex-col gap-3 py-10 text-center">
          <Icon name="lucide:wallet" size="40" class="text-muted" />
          <div class="text-muted text-sm">
            {{ t('budgets.empty') }}
          </div>
          <UiButtonAccent rounded @click="openCreate">
            {{ t('budgets.add') }}
          </UiButtonAccent>
        </div>

        <!-- List (active groups; archived group still shows when only archived budgets remain) -->
        <BudgetsList
          v-if="budgetsStore.hasItems"
          :periodStart="period.range.value.start"
          :progressFor="progressFor"
          @edit="openEdit"
          @history="openHistory"
          @move="openMove"
          @trns="openTrns"
        />
      </template>
    </div>

    <BudgetsForm
      v-if="showForm"
      :budgetId="editingId"
      @closed="onFormClosed"
    />

    <BudgetsMoveMoney
      v-if="movingToId"
      :toId="movingToId"
      :progressFor="progressFor"
      @confirm="onMoveConfirm"
      @closed="movingToId = undefined"
    />

    <BudgetsReduceAssign
      v-if="showReduceAssign"
      :overBase="-toAssignTotal"
      :progressFor="progressFor"
      :reduceAssignment="reduceAssignment"
      @closed="showReduceAssign = false"
    />

    <BudgetsHistory
      v-if="historyId"
      :budgetId="historyId"
      :history="historyFor(historyId)"
      :periodType="period.periodType.value"
      @closed="historyId = undefined"
    />

    <BudgetsTrns
      v-if="trnsId"
      :budgetId="trnsId"
      :periodLabel="periodLabel"
      :trnsIds="trnsIdsFor(trnsId)"
      @closed="trnsId = undefined"
    />

    <LayoutConfirmModal
      v-if="confirmAutoAssign"
      :title="t('budgets.confirm.autoAssignTitle')"
      :description="t('budgets.confirm.autoAssignText')"
      :confirmLabel="t('budgets.autoAssign')"
      @closed="confirmAutoAssign = false"
      @confirm="copyLastPeriod"
    />
  </UiPage>
</template>
