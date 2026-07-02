<script setup lang="ts">
import type { RecurrenceEndMode, RecurrenceFreq, RecurrenceId, RecurrenceItem } from '~/components/recurrences/types'

import { useCategoriesStore } from '~/components/categories/useCategoriesStore'
import { civilDayKey, formatByLocale, toCivilDayEpoch, todayCivilDayEpoch } from '~/components/date/utils'
import { nextOccurrence } from '~/components/recurrences/occurrences'
import { recurrenceFreqs } from '~/components/recurrences/types'
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
const freq = ref<RecurrenceFreq>(existing.value?.freq ?? 'month')
const interval = ref<number>(existing.value?.interval ?? 1)
const monthLastDay = ref<boolean>(existing.value?.monthLastDay ?? false)
const autoCreate = ref<boolean>(existing.value?.autoCreate ?? true)
const endMode = ref<RecurrenceEndMode>(existing.value?.endMode ?? 'never')
const endCount = ref<number | null>(existing.value?.endCount ?? null)
const endDateEpoch = ref<number | null>(existing.value?.endDate ?? null)

const endModeOptions = computed(() => [
  { label: t('recurrences.end.never'), value: 'never' },
  { label: t('recurrences.end.date'), value: 'date' },
  { label: t('recurrences.end.count'), value: 'count' },
])

const endDateInput = computed({
  get: () => (endDateEpoch.value != null ? civilDayKey(endDateEpoch.value) : ''),
  set: (v: string) => {
    if (!v) {
      endDateEpoch.value = null
      return
    }
    const [y, m, d] = v.split('-').map(Number)
    endDateEpoch.value = toCivilDayEpoch(y!, m! - 1, d!)
  },
})

const amountNumber = computed(() => Number.parseFloat(amount.value))
const canSave = computed(() => Number.isFinite(amountNumber.value) && amountNumber.value > 0 && interval.value >= 1)

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
    autoCreate: autoCreate.value,
    endCount: endMode.value === 'count' ? endCount.value : null,
    endDate: endMode.value === 'date' ? endDateEpoch.value : null,
    endMode: endMode.value,
    freq: freq.value,
    interval: interval.value,
    monthLastDay: freq.value === 'month' ? monthLastDay.value : false,
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

        <!-- Frequency -->
        <FormElement>
          <template #label>
            {{ t('recurrences.form.repeat') }}
          </template>
          <UiTabsBar>
            <UiTabsItemPill
              v-for="f in recurrenceFreqs"
              :key="f"
              :isActive="freq === f"
              @click="freq = f"
            >
              {{ t(`recurrences.freq.${f}`) }}
            </UiTabsItemPill>
          </UiTabsBar>
        </FormElement>

        <!-- Interval -->
        <FormElement>
          <template #label>
            {{ t('recurrences.form.every') }}
          </template>
          <div class="flex items-center gap-2">
            <UiNumberStepper
              :modelValue="interval"
              :min="1"
              @update:modelValue="interval = $event"
            />
            <span class="text-muted text-sm">{{ t(`recurrences.unit.${freq}`, interval) }}</span>
          </div>
        </FormElement>

        <!-- Options -->
        <div class="grid gap-1">
          <UiSwitchItem
            v-if="freq === 'month'"
            :checkboxValue="monthLastDay"
            :title="t('recurrences.form.monthLastDay')"
            @click="monthLastDay = !monthLastDay"
          />
          <UiSwitchItem
            :checkboxValue="autoCreate"
            :title="t('recurrences.form.autoCreate')"
            @click="autoCreate = !autoCreate"
          />
        </div>

        <!-- End condition -->
        <FormElement>
          <template #label>
            {{ t('recurrences.form.ends') }}
          </template>
          <FormSelect
            :options="endModeOptions"
            :value="endMode"
            @change="(v: string) => endMode = v as RecurrenceEndMode"
          />
          <input
            v-if="endMode === 'date'"
            v-model="endDateInput"
            type="date"
            class="bg-elevated/40 text-highlighted mt-2 rounded-sm px-3 py-2 text-sm"
          >
          <div v-if="endMode === 'count'" class="mt-2 flex items-center gap-2">
            <UiNumberStepper
              :modelValue="endCount ?? 1"
              :min="1"
              @update:modelValue="endCount = $event"
            />
            <span class="text-muted text-sm">{{ t('recurrences.end.countPlaceholder') }}</span>
          </div>
        </FormElement>
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
