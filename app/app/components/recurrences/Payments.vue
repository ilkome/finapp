<script setup lang="ts">
import { useStorage } from '@vueuse/core'

import type { OccurrenceStatus } from '~/components/recurrences/occurrences'
import type { RecurrenceId, RecurrenceItem } from '~/components/recurrences/types'

import { getAmountInRate } from '~/components/amount/getTotal'
import { useCategoriesStore } from '~/components/categories/useCategoriesStore'
import { useCurrenciesStore } from '~/components/currencies/useCurrenciesStore'
import { addCivilDays, addCivilMonths, formatByLocale, lastDayOfMonthCivil, startOfMonthCivil, todayCivilDayEpoch } from '~/components/date/utils'
import { committedNativeInRange, effectiveAmountFor, nextOccurrence, occurrencesInRange, occurrenceStatus, pendingConfirmOccurrences, periodProgress } from '~/components/recurrences/occurrences'
import { useRecurrencesStore } from '~/components/recurrences/useRecurrencesStore'
import { useTrnsFormStore } from '~/components/trnForm/useTrnsFormStore'
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
const trnsFormStore = useTrnsFormStore()
const trnsStore = useTrnsStore()
const categoriesStore = useCategoriesStore()
const walletsStore = useWalletsStore()
const currenciesStore = useCurrenciesStore()

const dateLocale = computed(() => locale.value.startsWith('ru') ? 'ru' : 'en')

// Period selection persists across visits (was an ephemeral ref before).
const horizons = [30, 60, 90] as const
const horizon = useStorage<number>('finapp.recurrences.horizon', 60)

// Show the last couple of weeks of already-realized charges alongside the forward schedule, so a
// silently changed price or a just-paid bill is visible without leaving the page.
const RECENT_DAYS = 14

const todayEpoch = computed(() => todayCivilDayEpoch())
const soonCutoff = computed(() => addCivilDays(todayCivilDayEpoch(), 7))

type Occurrence = { day: number, id: RecurrenceId, rule: RecurrenceItem }
type TimelineOccurrence = Occurrence & { status: OccurrenceStatus }

// Active rules, narrowed to the tapped subscription when a filter is set.
const rules = computed<[RecurrenceId, RecurrenceItem][]>(() => {
  const entries = Object.entries(recurrencesStore.activeItems) as [RecurrenceId, RecurrenceItem][]
  return filterId ? entries.filter(([id]) => id === filterId) : entries
})

const filteredRule = computed(() => (filterId ? recurrencesStore.items?.[filterId] : undefined))

// The subscription whose read-only price-history sheet is open (opened from the drill-down summary).
const historyId = ref<RecurrenceId>()

function categoryOf(rule: RecurrenceItem) {
  return categoriesStore.items?.[rule.categoryId]
}
function ruleName(rule: RecurrenceItem) {
  return rule.desc || categoryOf(rule)?.name || rule.categoryId
}
function walletCurrency(rule: RecurrenceItem) {
  return walletsStore.items?.[rule.walletId]?.currency ?? currenciesStore.base
}

// Manual (confirm-each) due occurrences with no trn yet: strictly after lastGeneratedDate, so a
// past-start + backfill-off rule doesn't flood the list with history.
const pending = computed<Occurrence[]>(() =>
  pendingConfirmOccurrences(rules.value, trnsStore.items ?? {}, todayCivilDayEpoch()),
)

// Timeline: recently-realized charges (last RECENT_DAYS) + the forward schedule (.. +horizon),
// oldest first, each tagged with its realized status. Past days appear only once materialized
// (paid or price-drifted) - still-unconfirmed past occurrences belong to the "due to confirm" block
// above, so they aren't duplicated here.
const occurrences = computed<TimelineOccurrence[]>(() => {
  const today = todayEpoch.value
  const trns = trnsStore.items ?? {}
  // Occurrences already surfaced by the "due to confirm" block above (manual, unconfirmed) must not
  // reappear here - the past-only guard misses a rule whose occurrence lands exactly today.
  const pendingKeys = new Set(pending.value.map(keyOf))
  const range = { end: addCivilDays(today, horizon.value), start: addCivilDays(today, -RECENT_DAYS) }
  const out: TimelineOccurrence[] = []
  for (const [id, rule] of rules.value) {
    for (const day of occurrencesInRange(rule, range)) {
      if (pendingKeys.has(`${id}:${day}`))
        continue
      const status = occurrenceStatus(rule, id, day, trns, today)
      if (day < today && status.state !== 'paid' && status.state !== 'drift')
        continue
      out.push({ day, id, rule, status })
    }
  }
  return out.sort((a, b) => a.day - b.day)
})

// Draft amount per pending row (variable bills - utilities, etc.): editable before confirming, seeded
// (unrounded) with the price effective that day. `editedKeys` marks rows the user actually changed, so
// an untouched Confirm passes no override and the store materializes the exact effective amount (no
// 2-decimal rounding drift for >2-dp fiat / crypto, no spurious "price changed"). Both maps are pruned
// as rows are confirmed/skipped so stale entries don't linger.
const amountDrafts = reactive<Record<string, string>>({})
const editedKeys = reactive(new Set<string>())
function keyOf(o: Occurrence) {
  return `${o.id}:${o.day}`
}
watch(pending, (list) => {
  const live = new Set<string>()
  for (const p of list) {
    const k = keyOf(p)
    live.add(k)
    if (!(k in amountDrafts))
      amountDrafts[k] = String(effectiveAmountFor(p.rule, p.day))
  }
  for (const k of Object.keys(amountDrafts)) {
    if (!live.has(k)) {
      delete amountDrafts[k]
      editedKeys.delete(k)
    }
  }
}, { immediate: true })

// Confirm one occurrence. Untouched row -> no amount override, so the store keeps the exact effective
// price. Edited row -> the parsed draft (blank/non-positive falls back to the store default).
function confirmPending(p: Occurrence) {
  const k = keyOf(p)
  if (!editedKeys.has(k)) {
    recurrencesStore.confirmOccurrence(p.id, p.day)
    return
  }
  const raw = Number.parseFloat(amountDrafts[k] ?? '')
  const amount = Number.isFinite(raw) && raw > 0 ? raw : undefined
  recurrencesStore.confirmOccurrence(p.id, p.day, amount)
}

// FormInput emits a string; mirror the old v-model + @input (set the draft, mark the row edited).
function onDraftInput(p: Occurrence, value: string) {
  amountDrafts[keyOf(p)] = value
  editedKeys.add(keyOf(p))
}

// Inline "delay" quick action for an overdue manual row. `rescheduleFrom` re-anchors the WHOLE
// series (shifts every future charge and collapses the rule's other overdue rows to the new
// phase) - the honest effect of the already-implemented store method, matching Form.vue's
// "Next charge date". Presets are based on TODAY (not the overdue p.day) so the new date is always
// in the future and the row leaves the overdue list.
const delayFor = ref<string | null>(null)
function toggleDelay(p: Occurrence) {
  const k = keyOf(p)
  delayFor.value = delayFor.value === k ? null : k
}
function delayPresets() {
  const t0 = todayEpoch.value
  return [
    { day: addCivilDays(t0, 1), label: t('recurrences.delay.tomorrow') },
    { day: addCivilDays(t0, 7), label: t('recurrences.delay.week') },
    { day: addCivilMonths(t0, 1), label: t('recurrences.delay.month') },
  ]
}
function delayTo(p: Occurrence, newDay: number) {
  recurrencesStore.rescheduleFrom(p.id, newDay)
  delayFor.value = null
}

// Bulk actions are confirmed first (skip-all is irreversible - there's no un-skip UI - and confirm-all
// materializes N trns at once). They snapshot the list before looping: confirming/skipping mutates the
// store and reactively shrinks `pending` mid-loop, which would otherwise skip every other row.
const bulkAction = ref<'confirm' | 'skip' | null>(null)
function confirmAll() {
  for (const p of [...pending.value])
    confirmPending(p)
}
function skipAll() {
  for (const p of [...pending.value])
    recurrencesStore.skipOccurrence(p.id, p.day)
}
function runBulk() {
  if (bulkAction.value === 'confirm')
    confirmAll()
  else if (bulkAction.value === 'skip')
    skipAll()
}

function statusDotClass(state: OccurrenceStatus['state']) {
  switch (state) {
    case 'paid': return 'bg-income-1'
    case 'drift': return 'bg-warning'
    case 'overdue': return 'bg-expense-1'
    default: return 'bg-neutral-400/50'
  }
}
function statusLabel(state: OccurrenceStatus['state']) {
  switch (state) {
    case 'paid': return t('recurrences.payments.paid')
    case 'drift': return t('recurrences.payments.priceChanged')
    case 'overdue': return t('recurrences.overdue')
    default: return ''
  }
}

function payEarly(o: TimelineOccurrence) {
  trnsFormStore.openFormForOccurrence({
    amount: o.status.expected,
    categoryId: o.rule.categoryId,
    date: todayEpoch.value,
    day: o.day,
    desc: o.rule.desc,
    ruleId: o.id,
    type: o.rule.type,
    walletId: o.rule.walletId,
  })
}

const groups = computed(() => {
  const map = new Map<number, TimelineOccurrence[]>()
  for (const o of occurrences.value) {
    const arr = map.get(o.day) ?? []
    arr.push(o)
    map.set(o.day, arr)
  }
  return [...map.entries()].map(([day, items]) => ({ day, items }))
})

const soonCount = computed(() => occurrences.value.filter(o => o.day >= todayEpoch.value && o.day <= soonCutoff.value).length)
const isEmpty = computed(() => !pending.value.length && !occurrences.value.length)

// Drill-down for the tapped subscription: committed yearly cost + next charge + a price-change hint.
const summary = computed(() => {
  const rule = filteredRule.value
  if (!rule)
    return undefined
  const start = todayCivilDayEpoch()
  const yearlyBase = getAmountInRate({
    amount: committedNativeInRange(rule, { end: addCivilDays(start, 365), start }),
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

// Copilot-style "this month" progress: how much of the current CALENDAR month's EXPENSE bills is
// already paid vs still scheduled, in base currency. Independent of the 30/60/90 timeline horizon;
// respects the active rule filter. drift counts as paid at its actual amount (see periodProgress).
const monthProgress = computed(() => {
  const start = startOfMonthCivil(todayEpoch.value)
  const end = lastDayOfMonthCivil(todayEpoch.value)
  const trns = trnsStore.items ?? {}
  let paidBase = 0
  let totalBase = 0
  let paidCount = 0
  let totalCount = 0
  for (const [id, rule] of rules.value) {
    if (rule.type !== TrnType.Expense)
      continue
    const p = periodProgress(rule, id, { end, start }, trns, todayEpoch.value)
    if (!p.totalCount)
      continue
    const toBase = (amount: number) => getAmountInRate({
      amount,
      baseCurrencyCode: currenciesStore.base,
      currencyCode: walletCurrency(rule),
      rates: currenciesStore.rates,
    })
    paidBase += toBase(p.paidNative)
    totalBase += toBase(p.totalNative)
    paidCount += p.paidCount
    totalCount += p.totalCount
  }
  if (totalCount === 0)
    return undefined
  return {
    leftBase: totalBase - paidBase,
    paidBase,
    paidCount,
    pct: totalBase > 0 ? Math.min(100, Math.round(paidBase / totalBase * 100)) : 0,
    totalBase,
    totalCount,
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

    <!-- This-month paid vs left (current calendar month, expense bills, base currency) -->
    <div v-if="monthProgress" class="mb-2 grid gap-1 px-1">
      <div class="text-2xs text-muted flex items-center gap-1">
        <span>{{ t('recurrences.payments.thisMonth') }}</span>
        <span>{{ monthProgress.paidCount }}/{{ monthProgress.totalCount }}</span>
        <span class="grow" />
        <Amount
          :amount="monthProgress.paidBase"
          :currencyCode="currenciesStore.base"
          :isShowBaseRate="false"
          variant="xs"
        />
        <span>{{ t('recurrences.payments.progressPaid') }}</span>
        <span>·</span>
        <Amount
          :amount="monthProgress.leftBase"
          :currencyCode="currenciesStore.base"
          :isShowBaseRate="false"
          variant="xs"
        />
        <span>{{ t('recurrences.payments.progressLeft') }}</span>
      </div>
      <div class="bg-default relative h-1.5 rounded-full">
        <div class="bg-income-1 h-full rounded-full transition-all" :style="{ width: `${monthProgress.pct}%` }" />
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
      <button
        v-if="summary"
        type="button"
        class="bg-elevated/40 interactive text-2xs text-muted flex w-full flex-wrap items-center gap-x-3 gap-y-0.5 rounded-md px-3 py-2 text-left"
        :aria-label="t('recurrences.history.open')"
        @click="historyId = filterId"
      >
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
        <span class="grow" />
        <Icon name="lucide:chevron-right" size="14" class="text-muted" />
      </button>
    </div>

    <div v-if="isEmpty" class="text-muted px-1 py-4 text-center text-sm">
      {{ t('recurrences.payments.empty') }}
    </div>

    <!-- Due & unconfirmed (overdue) -->
    <div v-if="pending.length" class="mb-3">
      <div class="mb-1 flex items-center gap-2 px-1">
        <UiTextSubtitle class="text-expense-1/80 tracking-wide uppercase">
          {{ t('recurrences.pending.title') }} ({{ pending.length }})
        </UiTextSubtitle>
        <span class="grow" />
        <template v-if="pending.length > 1">
          <button
            type="button"
            class="bg-primary/60 text-2xs text-icon-primary hover:bg-primary/80 rounded-sm px-2 py-1"
            @click="bulkAction = 'confirm'"
          >
            {{ t('recurrences.actions.confirmAll') }}
          </button>
          <button
            type="button"
            class="bg-default text-2xs text-muted hover:text-highlighted rounded-sm px-2 py-1"
            @click="bulkAction = 'skip'"
          >
            {{ t('recurrences.actions.skipAll') }}
          </button>
        </template>
      </div>
      <div class="grid gap-1">
        <div v-for="p in pending" :key="`${p.id}:${p.day}`" class="grid gap-1">
          <div class="bg-elevated flex items-center gap-2 rounded-md px-3 py-2">
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
            <FormInput
              :modelValue="amountDrafts[keyOf(p)] ?? ''"
              type="number"
              inputmode="decimal"
              min="0"
              step="any"
              :aria-label="t('recurrences.form.amount')"
              class="!bg-default !min-h-0 !w-20 !rounded-sm !px-2 !py-1 text-right !text-sm"
              @update:modelValue="(value: string) => onDraftInput(p, value)"
              @keydown.enter="confirmPending(p)"
            />
            <span class="text-2xs text-muted">{{ walletCurrency(p.rule) }}</span>
            <button
              type="button"
              class="bg-default text-muted hover:text-highlighted rounded-sm p-1.5"
              :aria-label="t('recurrences.actions.delay')"
              @click="toggleDelay(p)"
            >
              <Icon name="lucide:clock" size="14" />
            </button>
            <button
              type="button"
              class="bg-primary/60 text-2xs text-icon-primary hover:bg-primary/80 rounded-sm px-2 py-1"
              @click="confirmPending(p)"
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
          <div
            v-if="delayFor === keyOf(p)"
            class="bg-elevated/50 flex flex-wrap items-center gap-1 rounded-md px-3 py-2"
          >
            <span class="text-2xs text-muted mr-1">{{ t('recurrences.delay.title') }}</span>
            <UiTabsItemPill
              v-for="opt in delayPresets()"
              :key="opt.day"
              variant="outline"
              @click="delayTo(p, opt.day)"
            >
              {{ opt.label }}
            </UiTabsItemPill>
          </div>
        </div>
      </div>
    </div>

    <!-- Timeline: recent realized + upcoming, status-colored -->
    <div v-if="occurrences.length" class="grid gap-2">
      <div v-for="group in groups" :key="group.day">
        <div
          class="text-2xs mb-0.5 px-1"
          :class="group.day >= todayEpoch && group.day <= soonCutoff ? 'text-primary font-medium' : 'text-muted'"
        >
          {{ fmtDay(group.day) }}
        </div>
        <div class="grid gap-1">
          <div
            v-for="o in group.items"
            :key="`${o.id}:${o.day}`"
            class="bg-elevated flex items-center gap-2 rounded-md px-3 py-2"
            :class="o.status.state === 'upcoming' ? 'interactive cursor-pointer' : ''"
            :role="o.status.state === 'upcoming' ? 'button' : undefined"
            :tabindex="o.status.state === 'upcoming' ? 0 : undefined"
            :aria-label="o.status.state === 'upcoming' ? t('recurrences.actions.payEarly') : undefined"
            @click="o.status.state === 'upcoming' && payEarly(o)"
            @keydown.enter="o.status.state === 'upcoming' && payEarly(o)"
            @keydown.space.prevent="o.status.state === 'upcoming' && payEarly(o)"
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
              <div
                v-if="!o.rule.autoCreate || o.status.state === 'drift'"
                class="text-2xs flex items-center gap-1"
                :class="o.status.state === 'drift' ? 'text-warning' : 'text-muted'"
              >
                <span v-if="!o.rule.autoCreate">{{ t('recurrences.manual') }}</span>
                <span v-if="o.status.state === 'drift'">{{ t('recurrences.payments.priceChanged') }}</span>
              </div>
            </div>
            <span
              class="size-1.5 shrink-0 rounded-full"
              :class="statusDotClass(o.status.state)"
              :title="statusLabel(o.status.state)"
            />
            <Amount
              :amount="o.status.actual ?? o.status.expected"
              :colorize="o.rule.type === TrnType.Income ? 'income' : undefined"
              :currencyCode="walletCurrency(o.rule)"
              :isShowBaseRate="false"
              :type="o.rule.type"
              variant="sm"
            />
            <Icon
              v-if="o.status.state === 'upcoming'"
              name="lucide:chevron-right"
              size="14"
              class="text-muted shrink-0"
            />
          </div>
        </div>
      </div>
    </div>

    <RecurrencesHistorySheet
      v-if="historyId"
      :recurrenceId="historyId"
      @closed="historyId = undefined"
    />

    <LayoutConfirmModal
      v-if="bulkAction"
      :title="t(bulkAction === 'skip' ? 'recurrences.confirm.skipAllTitle' : 'recurrences.confirm.confirmAllTitle', { count: pending.length })"
      :description="t(bulkAction === 'skip' ? 'recurrences.confirm.skipAllText' : 'recurrences.confirm.confirmAllText', { count: pending.length })"
      :confirmLabel="t(bulkAction === 'skip' ? 'recurrences.actions.skipAll' : 'recurrences.actions.confirmAll')"
      @closed="bulkAction = null"
      @confirm="runBulk"
    />
  </div>
</template>
