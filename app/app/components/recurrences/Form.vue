<script setup lang="ts">
import type { RecurrenceId, RecurrenceItem, RecurrenceSchedule } from '~/components/recurrences/types'

import { useCategoriesStore } from '~/components/categories/useCategoriesStore'
import { civilDayKey, formatByLocale, toCivilDayEpoch, todayCivilDayEpoch } from '~/components/date/utils'
import { nextOccurrence } from '~/components/recurrences/occurrences'
import { useRecurrencesStore } from '~/components/recurrences/useRecurrencesStore'
import { TrnType } from '~/components/trns/types'
import { useWalletsStore } from '~/components/wallets/useWalletsStore'

const props = defineProps<{
  recurrenceId: RecurrenceId
}>()

const emit = defineEmits<{
  closed: []
}>()

const { locale, t } = useI18n()
const recurrencesStore = useRecurrencesStore()
const categoriesStore = useCategoriesStore()
const walletsStore = useWalletsStore()

const dateLocale = computed(() => locale.value.startsWith('ru') ? 'ru' : 'en')

const existing = computed(() => recurrencesStore.items?.[props.recurrenceId])
const category = computed(() => existing.value ? categoriesStore.items?.[existing.value.categoryId] : undefined)
const wallet = computed(() => existing.value ? walletsStore.items?.[existing.value.walletId] : undefined)
const typeLabel = computed(() => existing.value?.type === TrnType.Income ? t('money.income') : t('money.expense'))

// Editable schedule fields (category/wallet/type stay fixed - they define the series identity).
const amount = ref<string>(existing.value ? String(existing.value.amount) : '')
const schedule = reactive<RecurrenceSchedule>({
  autoCreate: existing.value?.autoCreate ?? true,
  endCount: existing.value?.endCount ?? null,
  endDate: existing.value?.endDate ?? null,
  endMode: existing.value?.endMode ?? 'never',
  freq: existing.value?.freq ?? 'month',
  interval: existing.value?.interval ?? 1,
  monthLastDay: existing.value?.monthLastDay ?? false,
})

const amountNumber = computed(() => Number.parseFloat(amount.value))
const canSave = computed(() => Number.isFinite(amountNumber.value) && amountNumber.value > 0 && schedule.interval >= 1)

// Price change: a new amount takes effect from a chosen day (default today), recorded in history.
const amountChanged = computed(() => existing.value != null && amountNumber.value !== existing.value.amount)
const effectiveFromEpoch = ref<number>(todayCivilDayEpoch())
const effectiveFromInput = computed({
  get: () => civilDayKey(effectiveFromEpoch.value),
  set: (v: string) => {
    if (!v)
      return
    const [y, m, d] = v.split('-').map(Number)
    effectiveFromEpoch.value = toCivilDayEpoch(y!, m! - 1, d!)
  },
})

// Change the next charge date (re-anchors the cadence from there). Empty = keep current schedule.
const rescheduleEpoch = ref<number | null>(null)
const rescheduleInput = computed({
  get: () => (rescheduleEpoch.value != null ? civilDayKey(rescheduleEpoch.value) : ''),
  set: (v: string) => {
    if (!v) {
      rescheduleEpoch.value = null
      return
    }
    const [y, m, d] = v.split('-').map(Number)
    rescheduleEpoch.value = toCivilDayEpoch(y!, m! - 1, d!)
  },
})

const nextChargeLabel = computed(() => {
  if (!existing.value)
    return ''
  const next = nextOccurrence(existing.value, todayCivilDayEpoch())
  return next != null ? formatByLocale(next, 'd MMM yyyy', dateLocale.value) : t('recurrences.form.noNext')
})

// Price history, newest first (seed the current price when it was never changed).
const priceHistory = computed(() => {
  const rule = existing.value
  if (!rule)
    return []
  const list = rule.amountHistory?.length
    ? [...rule.amountHistory]
    : [{ amount: rule.amount, from: rule.anchorDate }]
  return list.sort((a, b) => b.from - a.from)
})

function onSave(close: () => void) {
  const prev = existing.value
  if (!prev || !canSave.value)
    return
  // Schedule/options/end conditions (amount and price history are handled separately below).
  const values: RecurrenceItem = {
    ...prev,
    autoCreate: schedule.autoCreate,
    endCount: schedule.endMode === 'count' ? schedule.endCount : null,
    endDate: schedule.endMode === 'date' ? schedule.endDate : null,
    endMode: schedule.endMode,
    freq: schedule.freq,
    interval: schedule.interval,
    monthLastDay: schedule.freq === 'month' ? schedule.monthLastDay : false,
    updatedAt: Date.now(),
  }
  recurrencesStore.saveRecurrence(values, props.recurrenceId)
  if (amountChanged.value)
    recurrencesStore.changeAmount(props.recurrenceId, amountNumber.value, effectiveFromEpoch.value)
  if (rescheduleEpoch.value != null)
    recurrencesStore.rescheduleFrom(props.recurrenceId, rescheduleEpoch.value)
  close()
}
</script>

<template>
  <BottomSheetModal @closed="emit('closed')">
    <template #default="{ close }">
      <UiTitleModal>
        {{ t('recurrences.editTitle') }}
      </UiTitleModal>

      <div class="bottomSheetContentInside scrollerBlock grid content-start gap-5 px-3 py-2">
        <!-- Series context (read-only: category/wallet/type define the series identity). -->
        <div class="grid gap-1">
          <div class="bg-elevated/30 flex items-center gap-2 rounded-md px-3 py-2">
            <div
              class="flex size-7 shrink-0 items-center justify-center rounded-full"
              :style="{ background: category?.color ?? 'var(--ui-bg-accented)' }"
            >
              <Icon :name="category?.icon ?? 'lucide:repeat'" size="16" class="text-white" />
            </div>
            <div class="min-w-0">
              <div class="text-highlighted truncate text-sm">
                {{ category?.name ?? existing?.categoryId }}
              </div>
              <div class="text-2xs text-muted truncate">
                {{ wallet?.name }} · {{ typeLabel }}<template v-if="wallet?.currency">
                  · {{ wallet.currency }}
                </template>
              </div>
            </div>
          </div>
          <div class="text-2xs text-muted flex items-center gap-1 px-1">
            <Icon name="lucide:lock" size="12" />
            {{ t('recurrences.form.lockedHint') }}
          </div>
        </div>

        <!-- Amount -->
        <FormElement>
          <template #label>
            {{ t('recurrences.form.amount') }}
          </template>
          <FormInput
            v-model="amount"
            :placeholder="t('recurrences.form.amount')"
            type="number"
          />
          <!-- When the price changes, record from which day it applies (default today). -->
          <label v-if="amountChanged" class="text-2xs text-muted mt-2 flex items-center gap-2">
            {{ t('recurrences.form.effectiveFrom') }}
            <input
              v-model="effectiveFromInput"
              type="date"
              class="bg-elevated/40 text-highlighted rounded-sm px-2 py-1"
            >
          </label>
        </FormElement>

        <!-- Price history -->
        <FormElement v-if="priceHistory.length > 1">
          <template #label>
            {{ t('recurrences.form.priceHistory') }}
          </template>
          <div class="grid gap-1">
            <div
              v-for="(p, i) in priceHistory"
              :key="p.from"
              class="text-2xs flex items-center justify-between"
              :class="i === 0 ? 'text-highlighted' : 'text-muted'"
            >
              <span>{{ t('recurrences.form.priceFrom') }} {{ formatByLocale(p.from, 'd MMM yyyy', dateLocale) }}</span>
              <Amount
                :amount="p.amount"
                :currencyCode="wallet?.currency ?? 'USD'"
                :isShowBaseRate="false"
                :type="existing?.type ?? TrnType.Expense"
                variant="sm"
              />
            </div>
          </div>
        </FormElement>

        <!-- Next charge date (re-anchors the cadence from a chosen day) -->
        <FormElement>
          <template #label>
            {{ t('recurrences.form.nextCharge') }}
          </template>
          <div class="flex items-center gap-2">
            <input
              v-model="rescheduleInput"
              type="date"
              class="bg-elevated/40 text-highlighted rounded-sm px-3 py-2 text-sm"
            >
            <span class="text-2xs text-muted">{{ t('recurrences.form.currentNext') }} {{ nextChargeLabel }}</span>
          </div>
        </FormElement>

        <!-- Schedule (frequency / interval / options / end condition) -->
        <RecurrencesScheduleEditor v-model="schedule" />
      </div>

      <!-- Pinned footer (lives in the sheet's auto row, never scrolls away) -->
      <div class="bottomSheetContentBottom">
        <UiButtonAccent
          class="sm:max-w-xs"
          rounded
          :disabled="!canSave"
          @click="onSave(close)"
        >
          {{ t('base.save') }}
        </UiButtonAccent>
      </div>
    </template>
  </BottomSheetModal>
</template>
