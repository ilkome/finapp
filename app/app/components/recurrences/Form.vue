<script setup lang="ts">
import type { CategoryId } from '~/components/categories/types'
import type { RecurrenceId, RecurrenceItem, RecurrenceSchedule } from '~/components/recurrences/types'
import type { WalletId } from '~/components/wallets/types'

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
const typeLabel = computed(() => existing.value?.type === TrnType.Income ? t('money.income') : t('money.expense'))

// Category and wallet are editable; the edit only steers FUTURE occurrences (buildOccurrenceTrn
// reads them at generation time, and the occurrence trn id excludes them), so already-created trns
// keep their old category/wallet. Type stays fixed - flipping it would reinterpret history/stats.
const categoryId = ref<CategoryId>(existing.value?.categoryId ?? '')
const walletId = ref<WalletId>(existing.value?.walletId ?? '')
const isPickingCategory = ref(false)
const isPickingWallet = ref(false)

const category = computed(() => categoriesStore.items?.[categoryId.value])
const wallet = computed(() => walletsStore.items?.[walletId.value])

// Switching to a wallet in another currency reinterprets amounts (no conversion), so warn the user.
const originalCurrency = existing.value ? walletsStore.items?.[existing.value.walletId]?.currency : undefined
const currencyChanged = computed(() => !!wallet.value?.currency && !!originalCurrency && wallet.value.currency !== originalCurrency)

function onSelectCategory(id: CategoryId) {
  categoryId.value = id
  isPickingCategory.value = false
}

function onSelectWallet(id: WalletId) {
  walletId.value = id
  isPickingWallet.value = false
}

// Editable schedule fields (type stays fixed - it defines the series identity).
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
const canSave = computed(() => Number.isFinite(amountNumber.value) && amountNumber.value > 0 && schedule.interval >= 1 && !!categoryId.value && !!walletId.value)

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
    categoryId: categoryId.value,
    endCount: schedule.endMode === 'count' ? schedule.endCount : null,
    endDate: schedule.endMode === 'date' ? schedule.endDate : null,
    endMode: schedule.endMode,
    freq: schedule.freq,
    interval: schedule.interval,
    monthLastDay: schedule.freq === 'month' ? schedule.monthLastDay : false,
    updatedAt: Date.now(),
    walletId: walletId.value,
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
        <!-- Category (editable: steers future occurrences only) -->
        <FormElement>
          <template #label>
            {{ t('recurrences.form.category') }}
          </template>
          <UiButtonWithRight @click="isPickingCategory = true">
            <template #value>
              <span
                v-if="category"
                class="flex size-5 shrink-0 items-center justify-center rounded-full"
                :style="{ background: category.color ?? 'var(--ui-bg-accented)' }"
              >
                <Icon :name="category.icon ?? 'lucide:folder'" size="12" class="text-white" />
              </span>
              <span :class="category ? 'text-highlighted' : 'text-muted'">
                {{ category?.name ?? t('recurrences.form.selectCategory') }}
              </span>
            </template>
          </UiButtonWithRight>
        </FormElement>

        <!-- Wallet (editable: steers future occurrences only) -->
        <FormElement>
          <template #label>
            {{ t('recurrences.form.wallet') }}
          </template>
          <UiButtonWithRight @click="isPickingWallet = true">
            <template #value>
              <span :class="wallet ? 'text-highlighted' : 'text-muted'">
                {{ wallet?.name ?? t('recurrences.form.selectWallet') }}
              </span>
              <span v-if="wallet?.currency" class="text-2xs text-muted">{{ wallet.currency }}</span>
            </template>
          </UiButtonWithRight>
          <div class="grid gap-1 px-1 pt-1">
            <div class="text-2xs text-muted flex items-center gap-1">
              <Icon name="lucide:lock" size="12" />
              {{ typeLabel }} · {{ t('recurrences.form.lockedHint') }}
            </div>
            <div class="text-2xs text-muted flex items-center gap-1">
              <Icon name="lucide:info" size="12" />
              {{ t('recurrences.form.editKeepsHint') }}
            </div>
            <div v-if="currencyChanged" class="text-2xs text-warning flex items-center gap-1">
              <Icon name="lucide:triangle-alert" size="12" />
              {{ t('recurrences.form.currencyChangeHint', { currency: wallet?.currency }) }}
            </div>
          </div>
        </FormElement>

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

      <BottomSheetModal
        v-if="isPickingCategory"
        @closed="isPickingCategory = false"
      >
        <div class="bottomSheetContentInside scrollerBlock h-[70vh]">
          <CategoriesSelectorModal
            :activeItemId="categoryId"
            @selected="onSelectCategory"
          />
        </div>
      </BottomSheetModal>

      <BottomSheetModal
        v-if="isPickingWallet"
        @closed="isPickingWallet = false"
      >
        <div class="bottomSheetContentInside scrollerBlock h-[70vh]">
          <WalletsSelector
            :activeItemId="walletId"
            withHeader
            class="px-2"
            @selected="onSelectWallet"
          />
        </div>
      </BottomSheetModal>
    </template>
  </BottomSheetModal>
</template>
