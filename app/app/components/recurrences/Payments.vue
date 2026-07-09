<script setup lang="ts">
import { useStorage } from '@vueuse/core'

import type { RecurrenceId, RecurrenceItem } from '~/components/recurrences/types'

import { getAmountInRate } from '~/components/amount/getTotal'
import { useCategoriesStore } from '~/components/categories/useCategoriesStore'
import { useCurrenciesStore } from '~/components/currencies/useCurrenciesStore'
import { addCivilDays, formatByLocale, todayCivilDayEpoch } from '~/components/date/utils'
import { dueOccurrences, nextOccurrence, occurrencesInRange, occurrenceTrnId } from '~/components/recurrences/occurrences'
import { useRecurrencesStore } from '~/components/recurrences/useRecurrencesStore'
import { TrnType } from '~/components/trns/types'
import { useTrnsStore } from '~/components/trns/useTrnsStore'
import { useWalletsStore } from '~/components/wallets/useWalletsStore'

const { filterId } = defineProps<{
  filterId?: RecurrenceId
}>()

const emit = defineEmits<{
  clearFilter: []
}>()

const { locale, t } = useI18n()
const recurrencesStore = useRecurrencesStore()
const trnsStore = useTrnsStore()
const categoriesStore = useCategoriesStore()
const walletsStore = useWalletsStore()
const currenciesStore = useCurrenciesStore()

const dateLocale = computed(() => locale.value.startsWith('ru') ? 'ru' : 'en')

// Period selection persists across visits (was an ephemeral ref before).
const horizons = [30, 60, 90] as const
const horizon = useStorage<number>('finapp.recurrences.horizon', 60)

const soonCutoff = computed(() => addCivilDays(todayCivilDayEpoch(), 7))

type Occurrence = { day: number, id: RecurrenceId, rule: RecurrenceItem }

// Active rules, narrowed to the tapped subscription when a filter is set.
const rules = computed<[RecurrenceId, RecurrenceItem][]>(() => {
  const entries = Object.entries(recurrencesStore.activeItems) as [RecurrenceId, RecurrenceItem][]
  return filterId ? entries.filter(([id]) => id === filterId) : entries
})

const filteredRule = computed(() => (filterId ? recurrencesStore.items?.[filterId] : undefined))

function categoryOf(rule: RecurrenceItem) {
  return categoriesStore.items?.[rule.categoryId]
}
function ruleName(rule: RecurrenceItem) {
  return rule.desc || categoryOf(rule)?.name || rule.categoryId
}
function walletCurrency(rule: RecurrenceItem) {
  return walletsStore.items?.[rule.walletId]?.currency ?? currenciesStore.base
}

// Manual (confirm-each) due occurrences with no trn yet: strictly after lastGeneratedDate (via
// dueOccurrences), so a past-start + backfill-off rule no longer floods the list with history.
const pending = computed(() => {
  const today = todayCivilDayEpoch()
  const trns = trnsStore.items ?? {}
  const out: Occurrence[] = []
  for (const [id, rule] of rules.value) {
    if (rule.autoCreate)
      continue
    for (const day of dueOccurrences(rule, today)) {
      if (!trns[occurrenceTrnId(id, day)])
        out.push({ day, id, rule })
    }
  }
  return out.sort((a, b) => a.day - b.day)
})

// Forward occurrences (tomorrow .. +horizon), oldest first.
const occurrences = computed<Occurrence[]>(() => {
  const today = todayCivilDayEpoch()
  const range = { end: addCivilDays(today, horizon.value), start: addCivilDays(today, 1) }
  const out: Occurrence[] = []
  for (const [id, rule] of rules.value) {
    for (const day of occurrencesInRange(rule, range))
      out.push({ day, id, rule })
  }
  return out.sort((a, b) => a.day - b.day)
})

const groups = computed(() => {
  const map = new Map<number, Occurrence[]>()
  for (const o of occurrences.value) {
    const arr = map.get(o.day) ?? []
    arr.push(o)
    map.set(o.day, arr)
  }
  return [...map.entries()].map(([day, items]) => ({ day, items }))
})

const soonCount = computed(() => occurrences.value.filter(o => o.day <= soonCutoff.value).length)
const isEmpty = computed(() => !pending.value.length && !occurrences.value.length)

// Drill-down for the tapped subscription: committed yearly cost + next charge + a price-change hint.
const summary = computed(() => {
  const rule = filteredRule.value
  if (!rule)
    return undefined
  const start = todayCivilDayEpoch()
  const count = occurrencesInRange(rule, { end: addCivilDays(start, 365), start }).length
  const yearlyBase = getAmountInRate({
    amount: rule.amount * count,
    baseCurrencyCode: currenciesStore.base,
    currencyCode: walletCurrency(rule),
    rates: currenciesStore.rates,
  })
  const next = nextOccurrence(rule, start)
  return {
    hasPriceHistory: (rule.amountHistory?.length ?? 0) > 1,
    nextLabel: next != null ? formatByLocale(next, 'd MMM yyyy', dateLocale.value) : undefined,
    yearlyBase,
  }
})

function fmtDay(day: number) {
  return formatByLocale(day, 'EEE, d MMM', dateLocale.value)
}
</script>

<template>
  <div>
    <div class="mb-1 flex flex-wrap items-center gap-2 px-1">
      <UiTextSubtitle class="tracking-wide uppercase">
        {{ t('recurrences.payments.title') }}
      </UiTextSubtitle>
      <span v-if="soonCount" class="bg-primary/15 text-primary text-2xs rounded-full px-1.5 py-0.5">
        {{ t('recurrences.upcoming.dueSoon', { count: soonCount }) }}
      </span>
      <span class="grow" />
      <div class="flex gap-1">
        <UiTabsItemPill
          v-for="h in horizons"
          :key="h"
          :isActive="horizon === h"
          variant="outline"
          @click="horizon = h"
        >
          {{ t('recurrences.upcoming.days', { count: h }) }}
        </UiTabsItemPill>
      </div>
    </div>

    <!-- Active per-subscription filter (tapped from Подписки) -->
    <div v-if="filteredRule" class="mb-2 grid gap-1.5">
      <div class="flex items-center gap-2 px-1">
        <span class="text-2xs text-muted">{{ t('recurrences.payments.only') }}</span>
        <button
          type="button"
          class="bg-primary/15 text-primary interactive flex items-center gap-1 rounded-full py-1 pr-1.5 pl-2.5 text-sm"
          @click="emit('clearFilter')"
        >
          <span class="max-w-[60vw] truncate">{{ ruleName(filteredRule) }}</span>
          <Icon name="lucide:x" size="15" />
        </button>
      </div>
      <div v-if="summary" class="bg-elevated/40 text-2xs text-muted flex flex-wrap items-center gap-x-3 gap-y-0.5 rounded-md px-3 py-2">
        <span class="flex items-center gap-1">
          ≈ <Amount
            :amount="summary.yearlyBase"
            :currencyCode="currenciesStore.base"
            :isShowBaseRate="false"
            :type="filteredRule.type"
            variant="sm"
          /> {{ t('recurrences.totals.yearly').toLowerCase() }}
        </span>
        <span v-if="summary.nextLabel">· {{ t('recurrences.next') }} {{ summary.nextLabel }}</span>
        <span v-if="summary.hasPriceHistory" class="text-primary">· {{ t('recurrences.payments.priceChanged') }}</span>
      </div>
    </div>

    <div v-if="isEmpty" class="text-muted px-1 py-4 text-center text-sm">
      {{ t('recurrences.payments.empty') }}
    </div>

    <!-- Due & unconfirmed (overdue) -->
    <div v-if="pending.length" class="mb-3">
      <UiTextSubtitle class="text-expense-1/80 mb-1 px-1 tracking-wide uppercase">
        {{ t('recurrences.pending.title') }} ({{ pending.length }})
      </UiTextSubtitle>
      <div class="grid gap-1">
        <div
          v-for="p in pending"
          :key="`${p.id}:${p.day}`"
          class="bg-elevated flex items-center gap-2 rounded-md px-3 py-2"
        >
          <UiIconBase
            :name="categoryOf(p.rule)?.icon ?? 'lucide:repeat'"
            :color="categoryOf(p.rule)?.color"
            :size="15"
            class="size-7 shrink-0 p-1.5"
            invert
          />
          <div class="min-w-0 grow">
            <div class="text-highlighted truncate text-sm">
              {{ ruleName(p.rule) }}
            </div>
            <div class="text-2xs text-expense-1/80">
              {{ fmtDay(p.day) }} · {{ t('recurrences.overdue') }}
            </div>
          </div>
          <Amount
            :amount="p.rule.amount"
            :currencyCode="walletCurrency(p.rule)"
            :isShowBaseRate="false"
            :type="p.rule.type"
            variant="sm"
          />
          <button
            type="button"
            class="bg-primary/60 text-2xs text-icon-primary hover:bg-primary/80 rounded-sm px-2 py-1"
            @click="recurrencesStore.confirmOccurrence(p.id, p.day)"
          >
            {{ t('recurrences.actions.confirm') }}
          </button>
          <button
            type="button"
            class="bg-default text-2xs text-muted hover:text-highlighted rounded-sm px-2 py-1"
            @click="recurrencesStore.skipOccurrence(p.id, p.day)"
          >
            {{ t('recurrences.actions.skip') }}
          </button>
        </div>
      </div>
    </div>

    <!-- Forward timeline -->
    <div v-if="occurrences.length" class="grid gap-2">
      <div v-for="group in groups" :key="group.day">
        <div
          class="text-2xs mb-0.5 px-1"
          :class="group.day <= soonCutoff ? 'text-primary font-medium' : 'text-muted'"
        >
          {{ fmtDay(group.day) }}
        </div>
        <div class="grid gap-1">
          <div
            v-for="o in group.items"
            :key="`${o.id}:${o.day}`"
            class="bg-elevated flex items-center gap-2 rounded-md px-3 py-2"
          >
            <UiIconBase
              :name="categoryOf(o.rule)?.icon ?? 'lucide:repeat'"
              :color="categoryOf(o.rule)?.color"
              :size="15"
              class="size-7 shrink-0 p-1.5"
              invert
            />
            <div class="min-w-0 grow">
              <div class="text-highlighted truncate text-sm">
                {{ ruleName(o.rule) }}
              </div>
              <div v-if="!o.rule.autoCreate" class="text-2xs text-muted">
                {{ t('recurrences.manual') }}
              </div>
            </div>
            <Amount
              :amount="o.rule.amount"
              :colorize="o.rule.type === TrnType.Income ? 'income' : undefined"
              :currencyCode="walletCurrency(o.rule)"
              :isShowBaseRate="false"
              :type="o.rule.type"
              variant="sm"
            />
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
