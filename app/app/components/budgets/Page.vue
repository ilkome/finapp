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
const { copyLastPeriod, historyFor, moveMoney, periodIncomeTotal, progressFor, safeToSpendTotal, toAssignTotal } = useBudgetProgress(period)

// "To assign" is an envelope figure (income - assigned). Without period income it's just -assigned,
// which is confusing in limits mode, so only surface it once income lands this period. (A4)
const showToAssign = computed(() => periodIncomeTotal.value > 0)

// Paging into the past stops at the period holding the earliest transaction - older periods have
// no activity, so the same limit against zero spend is pointless. No transactions -> stay put.
const earliestTrnDate = computed(() => {
  let min = Number.POSITIVE_INFINITY
  for (const trn of Object.values(trnsStore.items ?? {})) {
    if (trn.date < min)
      min = trn.date
  }
  return min === Number.POSITIVE_INFINITY ? null : min
})

const canGoPrev = computed(() => {
  if (earliestTrnDate.value == null)
    return false
  const earliestPeriodStart = getStartOf(new UTCDate(earliestTrnDate.value), period.periodType.value).getTime()
  return period.range.value.start > earliestPeriodStart
})

function goPrev() {
  if (canGoPrev.value)
    period.prev()
}

useHead({ title: t('budgets.title') })

const showForm = ref(false)
const editingId = ref<BudgetId | undefined>()

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

        <div class="flex items-center gap-1">
          <UiActionButton
            :ariaLabel="t('base.previous')"
            :class="{ 'pointer-events-none opacity-30': !canGoPrev }"
            :disabled="!canGoPrev"
            @click="goPrev"
          >
            <Icon name="lucide:chevron-left" size="20" />
          </UiActionButton>
          <UiActionButton variant="text" @click="period.reset()">
            {{ periodLabel }}
          </UiActionButton>
          <UiActionButton
            :ariaLabel="t('base.next')"
            :class="{ 'pointer-events-none opacity-30': period.offset.value >= 0 }"
            :disabled="period.offset.value >= 0"
            @click="period.next()"
          >
            <Icon name="lucide:chevron-right" size="20" />
          </UiActionButton>
        </div>
      </div>

      <template v-if="budgetsStore.isReady">
        <!-- Hero: safe to spend + to assign -->
        <template v-if="budgetsStore.hasItems">
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
          <div class="-mt-2 flex justify-end">
            <UiActionButton variant="text" size="sm" @click="copyLastPeriod">
              <Icon name="lucide:copy" size="14" class="mr-1" />
              {{ t('budgets.autoAssign') }}
            </UiActionButton>
          </div>
        </template>

        <!-- Empty -->
        <div v-if="!budgetsStore.hasItems" class="flex-center grow flex-col gap-3 py-10 text-center">
          <Icon name="lucide:wallet" size="40" class="text-muted" />
          <div class="text-muted text-sm">
            {{ t('budgets.empty') }}
          </div>
          <UiButtonAccent rounded @click="openCreate">
            {{ t('budgets.add') }}
          </UiButtonAccent>
        </div>

        <!-- List -->
        <BudgetsList
          v-else
          :periodStart="period.range.value.start"
          :progressFor="progressFor"
          @edit="openEdit"
          @history="openHistory"
          @move="openMove"
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

    <BudgetsHistory
      v-if="historyId"
      :budgetId="historyId"
      :history="historyFor(historyId)"
      :periodType="period.periodType.value"
      @closed="historyId = undefined"
    />
  </UiPage>
</template>
