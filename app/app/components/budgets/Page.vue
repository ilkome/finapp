<script setup lang="ts">
import type { BudgetId, BudgetPeriodType } from '~/components/budgets/types'

import { budgetPeriodTypes } from '~/components/budgets/types'
import { useBudgetPeriod } from '~/components/budgets/useBudgetPeriod'
import { useBudgetProgress } from '~/components/budgets/useBudgetProgress'
import { useBudgetsStore } from '~/components/budgets/useBudgetsStore'
import { useCurrenciesStore } from '~/components/currencies/useCurrenciesStore'
import { formatByLocale } from '~/components/date/utils'

const { locale, t } = useI18n()
const budgetsStore = useBudgetsStore()
const currenciesStore = useCurrenciesStore()

const period = useBudgetPeriod()
const { progressFor, safeToSpendTotal } = useBudgetProgress(period)

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
    </UiHeader>

    <div class="grid max-w-3xl gap-4 px-2 pb-10 lg:px-4">
      <!-- Period type + navigation -->
      <div class="flex flex-wrap items-center justify-between gap-2">
        <div class="flex gap-1">
          <button
            v-for="type in budgetPeriodTypes"
            :key="type"
            type="button"
            class="rounded-md px-3 py-1.5 text-xs"
            :class="period.periodType.value === type ? 'bg-primary/70 text-icon-primary' : 'bg-elevated/40 text-muted hover:bg-elevated/60'"
            @click="setPeriodType(type)"
          >
            {{ t(`budgets.period.${type}`) }}
          </button>
        </div>

        <div class="flex items-center gap-1">
          <button
            type="button"
            class="bg-elevated/40 text-muted hover:bg-elevated/60 flex size-8 items-center justify-center rounded-md"
            :aria-label="t('base.previous')"
            @click="period.prev()"
          >
            <Icon name="lucide:chevron-left" size="18" />
          </button>
          <button
            type="button"
            class="bg-elevated/40 text-highlighted hover:bg-elevated/60 min-w-[8rem] rounded-md px-3 py-1.5 text-center text-xs"
            @click="period.reset()"
          >
            {{ periodLabel }}
          </button>
          <button
            type="button"
            class="bg-elevated/40 text-muted hover:bg-elevated/60 flex size-8 items-center justify-center rounded-md disabled:opacity-30"
            :aria-label="t('base.next')"
            :disabled="period.offset.value >= 0"
            @click="period.next()"
          >
            <Icon name="lucide:chevron-right" size="18" />
          </button>
        </div>
      </div>

      <!-- Hero: safe to spend -->
      <div v-if="budgetsStore.hasItems" class="bg-elevated rounded-md px-4 py-3">
        <div class="text-2xs text-muted tracking-wide uppercase">
          {{ t('budgets.hero.safeToSpend') }}
        </div>
        <Amount
          :amount="safeToSpendTotal"
          :colorize="safeToSpendTotal < 0 ? 'expense' : 'income'"
          :currencyCode="currenciesStore.base"
          :isShowBaseRate="false"
          align="left"
          variant="xl"
        />
      </div>

      <!-- Add -->
      <button
        type="button"
        class="bg-primary/15 text-primary hover:bg-primary/25 flex items-center justify-center gap-2 rounded-md px-3 py-2 text-sm"
        @click="openCreate"
      >
        <Icon name="lucide:plus" size="18" />
        {{ t('budgets.add') }}
      </button>

      <!-- Empty -->
      <div v-if="!budgetsStore.hasItems" class="flex-center grow flex-col py-10 text-center">
        <Icon name="lucide:wallet" size="40" class="text-muted mb-2" />
        <div class="text-muted text-sm">
          {{ t('budgets.empty') }}
        </div>
      </div>

      <!-- List -->
      <BudgetsList
        v-else
        :progressFor="progressFor"
        @edit="openEdit"
      />
    </div>

    <BudgetsForm
      v-if="showForm"
      :budgetId="editingId"
      @closed="onFormClosed"
    />
  </UiPage>
</template>
