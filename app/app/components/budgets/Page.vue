<script setup lang="ts">
import type { TabsItem } from '@nuxt/ui'

import { UTCDate } from '@date-fns/utc'
import { formatByLocale, todayCivilDayEpoch } from '~~/utils/date/civil'
import { getStartOf } from '~~/utils/date/period'

import type { BudgetId, BudgetPeriodType } from '~/components/budgets/types'

import { toAssignCardState } from '~/components/budgets/compute'
import { budgetPeriodTypes } from '~/components/budgets/types'
import { useBudgetPeriod } from '~/components/budgets/useBudgetPeriod'
import { useBudgetProgress } from '~/components/budgets/useBudgetProgress'
import { useBudgetsStore } from '~/components/budgets/useBudgetsStore'
import { useCurrenciesStore } from '~/components/currencies/useCurrenciesStore'
import { useRecurrenceTotals } from '~/components/recurrences/useRecurrenceTotals'
import { useTrnsStore } from '~/components/trns/useTrnsStore'

const { locale, t } = useI18n()
const budgetsStore = useBudgetsStore()
const currenciesStore = useCurrenciesStore()
const trnsStore = useTrnsStore()

const { openDocs } = useDocsLink()
const period = useBudgetPeriod()
const { assignedPoolTotal, copyLastPeriod, expectedPeriodIncomeTotal, historyFor, moveMoney, periodIncomeTotal, progressFor, reduceAssignment, safeToSpendBreakdown, safeToSpendTotal, toAssignTotal, trnsIdsFor } = useBudgetProgress(period)
// Only nextIncome is read here - the composable's `totals` (a lazy 365-day walk) must stay unread.
const { nextIncome } = useRecurrenceTotals()

// With period income the card is the real pool; with zero income it reframes to the assigned plan
// (neutral) instead of hiding, so the hero is honest in both directions. Hidden only when there is
// neither income nor assignment.
const toAssignState = computed(() => toAssignCardState(periodIncomeTotal.value, assignedPoolTotal.value))
const showToAssign = computed(() => toAssignState.value !== 'hidden')

// Past periods can never receive the expected income, so the note would be dishonest there.
const showExpectedIncomeNote = computed(() => toAssignState.value === 'planOnly'
  && expectedPeriodIncomeTotal.value > 0
  && period.range.value.end >= todayCivilDayEpoch())

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
const showSafeSheet = ref(false)

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

// Payday + per-day are pure decoration on the CURRENT period only - they never enter the amount.
const showNowCaption = computed(() => period.offset.value === 0)
// daysElapsed already includes today, so this counts today..end inclusive (floored at 1 so the
// last day still divides).
const remainingDays = computed(() => Math.max(1, period.daysInPeriod.value - period.daysElapsed.value + 1))
// A negative daily allowance is noise, so per-day only shows for a positive safe-to-spend.
const perDay = computed(() => showNowCaption.value && safeToSpendTotal.value > 0
  ? safeToSpendTotal.value / remainingDays.value
  : null)
const periodEndLabel = computed(() => formatByLocale(period.range.value.end, 'd MMM', dateLocale.value))

function setPeriodType(type: BudgetPeriodType) {
  period.periodType.value = type
  period.reset()
}

const periodTypeItems = computed<TabsItem[]>(() => budgetPeriodTypes.map(type => ({ label: t(`budgets.period.${type}`), value: type })))
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
        <UiTabs
          size="xs"
          :items="periodTypeItems"
          :modelValue="period.periodType.value"
          @update:modelValue="(v) => setPeriodType(v as BudgetPeriodType)"
        />

        <UiNavArrows
          :isEnd="!canGoNext"
          :isShowNavHome="period.offset.value !== 0"
          :isStart="!canGoPrev"
          @changeDate="onNav"
        >
          <UiActionButton variant="text" @click="period.reset()">
            {{ periodLabel }}
          </UiActionButton>
        </UiNavArrows>
      </div>

      <template v-if="budgetsStore.isReady">
        <!-- Hero: safe to spend + to assign (only meaningful with at least one active budget) -->
        <template v-if="hasActiveItems">
          <div class="grid grid-cols-1 gap-2" :class="{ 'sm:grid-cols-2': showToAssign }">
            <StatSumItem
              :amount="safeToSpendTotal"
              :aria-label="t('budgets.hero.safeToSpend')"
              :title="t('budgets.hero.safeToSpend')"
              :type="safeToSpendTotal < 0 ? 'expense' : 'income'"
              class="cursor-pointer focus-visible:ring-2 focus-visible:ring-primary focus-visible:outline-none"
              role="button"
              tabindex="0"
              @click="showSafeSheet = true"
              @keydown.enter.prevent="showSafeSheet = true"
              @keydown.space.prevent="showSafeSheet = true"
            >
              <Icon name="lucide:info" size="14" class="mb-1 text-muted" />
            </StatSumItem>
            <StatSumItem
              v-if="showToAssign"
              :amount="toAssignState === 'pool' ? toAssignTotal : assignedPoolTotal"
              :title="toAssignState === 'pool' ? t('budgets.hero.toAssign') : t('budgets.hero.assignedSoFar')"
              :type="toAssignState === 'pool' ? (toAssignTotal < 0 ? 'expense' : 'income') : 'netIncome'"
            >
              <div class="mb-1 grid gap-0.5 text-2xs text-muted">
                <div class="flex items-center justify-between gap-2">
                  <span>{{ t('budgets.toAssign.receivedLabel') }}</span>
                  <Amount
                    :amount="periodIncomeTotal"
                    :currencyCode="currenciesStore.base"
                    :isShowBaseRate="false"
                    align="left"
                    variant="xs"
                  />
                </div>
                <div class="flex items-center justify-between gap-2">
                  <span>{{ t('budgets.toAssign.assignedLabel') }}</span>
                  <Amount
                    :amount="assignedPoolTotal"
                    :currencyCode="currenciesStore.base"
                    :isShowBaseRate="false"
                    align="left"
                    variant="xs"
                  />
                </div>
              </div>
            </StatSumItem>
          </div>
          <div class="-mt-2 flex items-center justify-end gap-1">
            <div v-if="showNowCaption || showExpectedIncomeNote" class="mr-auto flex flex-wrap items-center gap-x-2 text-2xs text-muted">
              <span v-if="perDay != null">
                {{ t('budgets.safeSheet.perDay', { amount: Math.round(perDay) }) }} · {{ t('budgets.safeSheet.untilDate', { date: periodEndLabel }) }}
              </span>
              <NuxtLink
                v-if="showNowCaption && nextIncome"
                class="hover:text-default"
                to="/recurrences"
              >
                {{ t('budgets.safeSheet.payday', { date: formatByLocale(nextIncome.dayEpoch, 'd MMM', dateLocale) }) }}
              </NuxtLink>
              <NuxtLink
                v-if="showExpectedIncomeNote"
                class="hover:text-default"
                to="/recurrences"
              >
                {{ t('budgets.toAssign.expectedNote', { amount: Math.round(expectedPeriodIncomeTotal) }) }}
              </NuxtLink>
            </div>
            <UiActionButton
              v-if="toAssignState === 'pool' && toAssignTotal < 0"
              class="text-error"
              variant="text"
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
          <div class="text-sm text-muted">
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

    <BudgetsSafeToSpend
      v-if="showSafeSheet"
      :breakdown="safeToSpendBreakdown"
      :payday="showNowCaption ? nextIncome : null"
      :perDay="perDay"
      :periodEnd="period.range.value.end"
      :periodLabel="periodLabel"
      @closed="showSafeSheet = false"
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
